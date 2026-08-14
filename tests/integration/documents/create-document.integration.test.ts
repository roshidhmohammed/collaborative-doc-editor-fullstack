import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import {
  invalidDocumentCredentials,
  validDocumentCredentials,
} from "../../fixtures/documents/create-document";

import { createUser } from "../../factories/user.factory";

import {
  cleanUserData,
  disconnectDatabase,
} from "../../utils/database";

import { createFormData } from "../../utils/form-data";

import {
  mockAuthModule,
  mockVerifySession,
} from "../../mocks/dal/auth.mock";

import {
  mockNextCacheModule,
  mockRevalidatePath,
} from "../../mocks/next/cache.mock";

jest.unstable_mockModule(
  "@/lib/dal/auth",
  () => mockAuthModule,
);

jest.unstable_mockModule(
  "next/cache",
  () => mockNextCacheModule,
);

const { createDocument } = await import(
  "@/features/docs/actions/create-document"
);

describe("Create Document Integration", () => {
  let userId: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    const { user } = await createUser();

    userId = user.id;

    /*
     * Verify that the factory really persisted
     * the user before testing document creation.
     */
    const persistedUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    expect(persistedUser).not.toBeNull();

    mockVerifySession.mockResolvedValue({
      isAuth: true,
      userId,
    });
  });

  afterEach(async () => {
    await cleanUserData(userId);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("successful document creation", () => {
    it("creates a document for the authenticated user", async () => {
      const formData = createFormData({
        title:
          validDocumentCredentials.title,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message:
            "Document created successfully.",
          errors: "",
        }),
      );

      expect(
        result.docDetails,
      ).toEqual(
        expect.objectContaining({
          document:
            expect.objectContaining({
              name:
                validDocumentCredentials.title,
              creatorId: userId,
            }),

          ownerToken:
            expect.any(String),
        }),
      );
    });

    it("persists the created document", async () => {
      const formData = createFormData({
        title:
          validDocumentCredentials.title,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      const documentId =
        result.docDetails?.document.id;

      expect(documentId).toEqual(
        expect.any(String),
      );

      const document =
        await prisma.document.findUnique({
          where: {
            id: documentId,
          },
        });

      expect(document).toEqual(
        expect.objectContaining({
          id: documentId,
          name:
            validDocumentCredentials.title,
          creatorId: userId,
        }),
      );
    });

    it("creates the owner share link", async () => {
      const formData = createFormData({
        title:
          validDocumentCredentials.title,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      const documentId =
        result.docDetails?.document.id;

      const ownerShareLink =
        await prisma.documentShareLink.findFirst({
          where: {
            documentId,
            role: "OWNER",
          },
        });

      expect(ownerShareLink).toEqual(
        expect.objectContaining({
          documentId,
          createdById: userId,
          role: "OWNER",
          token:
            result.docDetails?.ownerToken,
        }),
      );
    });

    it("revalidates the documents path", async () => {
      const formData = createFormData({
        title:
          validDocumentCredentials.title,
      });

      await createDocument(
        undefined,
        formData,
      );

      expect(
        mockRevalidatePath,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockRevalidatePath,
      ).toHaveBeenCalledWith(
        "/documents",
      );
    });
  });

  describe("validation", () => {
    it("rejects an empty title", async () => {
      const createSpy = jest.spyOn(
        prisma.document,
        "create",
      );

      const formData = createFormData({
        title:
          invalidDocumentCredentials.emptyTitle,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toMatchObject({
        errors: {
          title: expect.any(Array),
        },
      });

      expect(createSpy).not.toHaveBeenCalled();

      expect(
        mockVerifySession,
      ).not.toHaveBeenCalled();

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();

      createSpy.mockRestore();
    });

    it("rejects a title shorter than two characters", async () => {
      const createSpy = jest.spyOn(
        prisma.document,
        "create",
      );

      const formData = createFormData({
        title:
          invalidDocumentCredentials.tooShortTitle,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toMatchObject({
        errors: {
          title: expect.arrayContaining([
            expect.stringContaining(
              "at least 2 characters",
            ),
          ]),
        },
      });

      expect(createSpy).not.toHaveBeenCalled();

      expect(
        mockVerifySession,
      ).not.toHaveBeenCalled();

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();

      createSpy.mockRestore();
    });

    it("rejects a title longer than fifty characters", async () => {
      const createSpy = jest.spyOn(
        prisma.document,
        "create",
      );

      const formData = createFormData({
        title:
          invalidDocumentCredentials.tooLongTitle,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toMatchObject({
        errors: {
          title: expect.arrayContaining([
            expect.stringContaining(
              "no more than 50 characters",
            ),
          ]),
        },
      });

      expect(createSpy).not.toHaveBeenCalled();

      expect(
        mockVerifySession,
      ).not.toHaveBeenCalled();

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();

      createSpy.mockRestore();
    });
  });

  describe("authentication failure", () => {
    it("returns an error when session verification fails", async () => {
      mockVerifySession.mockRejectedValueOnce(
        new Error("Unauthorized"),
      );

      const createSpy = jest.spyOn(
        prisma.document,
        "create",
      );

      const formData = createFormData({
        title:
          validDocumentCredentials.title,
      });

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Unauthorized",
        errors: "Unauthorized",
      });

      expect(createSpy).not.toHaveBeenCalled();

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();

      createSpy.mockRestore();
    });
  });
});