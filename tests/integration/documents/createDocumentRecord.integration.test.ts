import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import {
  validDocumentCredentials,
} from "../../fixtures/documents/create-document";

import { createUser } from "../../factories/user.factory";

import {
  cleanUserData,
  disconnectDatabase,
} from "../../utils/database";

import {
  mockAuthModule,
  mockVerifySession,
} from "../../mocks/dal/auth.mock";

jest.unstable_mockModule(
  "@/lib/dal/auth",
  () => mockAuthModule,
);

const { createDocumentRecord } =
  await import(
    "@/features/docs/services/create-document-record"
  );

describe("Create Document Record Integration", () => {
  let userId: string;

  beforeEach(async () => {
    jest.clearAllMocks();

    const { user } = await createUser();

    userId = user.id;

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

  it("creates a document for the authenticated user", async () => {
    const result =
      await createDocumentRecord(
        validDocumentCredentials.title,
      );

    expect(result.document).toEqual(
      expect.objectContaining({
        name:
          validDocumentCredentials.title,
        creatorId: userId,
      }),
    );
  });

  it("creates the initial document version", async () => {
    const result =
      await createDocumentRecord(
        validDocumentCredentials.title,
      );

    const versions =
      await prisma.documentVersion.findMany({
        where: {
          documentId:
            result.document.id,
        },
      });

    expect(versions).toHaveLength(1);

    expect(versions[0]).toEqual(
      expect.objectContaining({
        documentId:
          result.document.id,
        version: 1,
        createdById: userId,
      }),
    );
  });

  it("creates all required share links", async () => {
    const result =
      await createDocumentRecord(
        validDocumentCredentials.title,
      );

    const shareLinks =
      await prisma.documentShareLink.findMany({
        where: {
          documentId:
            result.document.id,
        },
      });

    expect(shareLinks).toHaveLength(3);

    expect(
      shareLinks.map(
        (shareLink) => shareLink.role,
      ),
    ).toEqual(
      expect.arrayContaining([
        "OWNER",
        "EDITOR",
        "VIEWER",
      ]),
    );
  });

  it("creates unique share tokens", async () => {
    const result =
      await createDocumentRecord(
        validDocumentCredentials.title,
      );

    const shareLinks =
      await prisma.documentShareLink.findMany({
        where: {
          documentId:
            result.document.id,
        },
      });

    const tokens =
      shareLinks.map(
        (shareLink) =>
          shareLink.token,
      );

    expect(
      new Set(tokens).size,
    ).toBe(tokens.length);
  });

  it("returns the owner share token", async () => {
    const result =
      await createDocumentRecord(
        validDocumentCredentials.title,
      );

    const ownerShareLink =
      await prisma.documentShareLink.findFirst({
        where: {
          documentId:
            result.document.id,
          role: "OWNER",
        },
      });

    expect(ownerShareLink).not.toBeNull();

    expect(
      result.ownerToken,
    ).toBe(ownerShareLink?.token);
  });

  it("associates every share link with the authenticated user", async () => {
    const result =
      await createDocumentRecord(
        validDocumentCredentials.title,
      );

    const shareLinks =
      await prisma.documentShareLink.findMany({
        where: {
          documentId:
            result.document.id,
        },
      });

    expect(
      shareLinks.every(
        (shareLink) =>
          shareLink.createdById === userId,
      ),
    ).toBe(true);
  });

  it("verifies the authenticated session before creating the document", async () => {
    await createDocumentRecord(
      validDocumentCredentials.title,
    );

    expect(
      mockVerifySession,
    ).toHaveBeenCalledTimes(1);
  });
});