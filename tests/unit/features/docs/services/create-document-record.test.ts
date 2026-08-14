import { createDocumentRecord } from "@/features/docs/services/create-document-record";

import { verifySession } from "@/lib/dal/auth";
import prisma from "@/lib/db/prisma";
import { generateShareToken } from "@/features/docs/utils/generateShareToken";

jest.mock("@/lib/dal/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    document: {
      create: jest.fn(),
    },
    documentShareLink: {
      create: jest.fn(),
    },
  },
}));

jest.mock(
  "@/features/docs/utils/generateShareToken",
  () => ({
    generateShareToken: jest.fn(),
  }),
);

describe("createDocumentRecord", () => {
  const mockVerifySession =
    verifySession as jest.MockedFunction<typeof verifySession>;

  const mockDocumentCreate =
    prisma.document.create as jest.MockedFunction<
      typeof prisma.document.create
    >;

  const mockShareLinkCreate =
    prisma.documentShareLink.create as jest.MockedFunction<
      typeof prisma.documentShareLink.create
    >;

  const mockGenerateShareToken =
    generateShareToken as jest.MockedFunction<
      typeof generateShareToken
    >;

  const mockSession = {
    userId: "user-123",
  };

  const mockDocument = {
    id: "document-123",
    name: "Project Planning",
    creatorId: "user-123",
    creator: {
      id: "user-123",
      email: "user@example.com",
      fullName: "Test User",
    },
  };

  const mockOwnerShareLink = {
    id: "owner-link-123",
    token: "owner-token",
    role: "OWNER",
    documentId: "document-123",
    createdById: "user-123",
  };

  const mockEditorShareLink = {
    id: "editor-link-123",
    token: "editor-token",
    role: "EDITOR",
    documentId: "document-123",
    createdById: "user-123",
  };

  const mockViewerShareLink = {
    id: "viewer-link-123",
    token: "viewer-token",
    role: "VIEWER",
    documentId: "document-123",
    createdById: "user-123",
  };

  beforeEach(() => {
    /*
     * IMPORTANT:
     * mockReset() clears both calls AND queued implementations.
     *
     * clearAllMocks() is not enough here.
     */
    mockVerifySession.mockReset();
    mockDocumentCreate.mockReset();
    mockShareLinkCreate.mockReset();
    mockGenerateShareToken.mockReset();

    mockVerifySession.mockResolvedValue(
      mockSession as any,
    );

    mockDocumentCreate.mockResolvedValue(
      mockDocument as any,
    );

    mockGenerateShareToken
      .mockReturnValueOnce("editor-token")
      .mockReturnValueOnce("viewer-token")
      .mockReturnValueOnce("owner-token");

    /*
     * Default successful behavior.
     */
    mockShareLinkCreate
      .mockResolvedValueOnce(
        mockOwnerShareLink as any,
      )
      .mockResolvedValueOnce(
        mockEditorShareLink as any,
      )
      .mockResolvedValueOnce(
        mockViewerShareLink as any,
      );
  });

  describe("Authentication", () => {
    it("verifies the current session", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockVerifySession,
      ).toHaveBeenCalledTimes(1);
    });

    it("does not create a document when session verification fails", async () => {
      mockVerifySession.mockRejectedValue(
        new Error("Unauthorized"),
      );

      await expect(
        createDocumentRecord(
          "Project Planning",
        ),
      ).rejects.toThrow("Unauthorized");

      expect(
        mockDocumentCreate,
      ).not.toHaveBeenCalled();

      expect(
        mockShareLinkCreate,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Document creation", () => {
    it("creates a document", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledTimes(1);
    });

    it("creates the document with the correct title", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledWith({
        data: {
          name: "Project Planning",
          creatorId: "user-123",
          versions: {
            create: {
              version: 1,
              createdBy: {
                connect: {
                  id: "user-123",
                },
              },
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });

    it("trims whitespace from the document title", async () => {
      await createDocumentRecord(
        "   Project Planning   ",
      );

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Project Planning",
          }),
        }),
      );
    });

    it("uses the authenticated user as creatorId", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            creatorId: "user-123",
          }),
        }),
      );
    });

    it("creates the initial document version", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            versions: {
              create: {
                version: 1,
                createdBy: {
                  connect: {
                    id: "user-123",
                  },
                },
              },
            },
          }),
        }),
      );
    });
  });

  describe("Share links", () => {
    it("generates three share tokens", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockGenerateShareToken,
      ).toHaveBeenCalledTimes(3);
    });

    it("creates the OWNER share link", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenNthCalledWith(
        1,
        {
          data: {
            token: "owner-token",
            role: "OWNER",
            documentId: "document-123",
            createdById: "user-123",
          },
        },
      );
    });

    it("creates the EDITOR share link", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenNthCalledWith(
        2,
        {
          data: {
            token: "editor-token",
            role: "EDITOR",
            documentId: "document-123",
            createdById: "user-123",
          },
        },
      );
    });

    it("creates the VIEWER share link", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenNthCalledWith(
        3,
        {
          data: {
            token: "viewer-token",
            role: "VIEWER",
            documentId: "document-123",
            createdById: "user-123",
          },
        },
      );
    });

    it("creates exactly three share links", async () => {
      await createDocumentRecord(
        "Project Planning",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenCalledTimes(3);
    });
  });

  describe("Return value", () => {
    it("returns the created document", async () => {
      const result =
        await createDocumentRecord(
          "Project Planning",
        );

      expect(result.document).toEqual(
        mockDocument,
      );
    });

    it("returns the OWNER token", async () => {
      const result =
        await createDocumentRecord(
          "Project Planning",
        );

      expect(result.ownerToken).toBe(
        "owner-token",
      );
    });

    it("returns the expected result structure", async () => {
      const result =
        await createDocumentRecord(
          "Project Planning",
        );

      expect(result).toEqual({
        document: mockDocument,
        ownerToken: "owner-token",
      });
    });
  });

  describe("Database errors", () => {
    it("propagates document creation errors", async () => {
      const error = new Error(
        "Database connection failed",
      );

      mockDocumentCreate.mockReset();
      mockDocumentCreate.mockRejectedValue(error);

      await expect(
        createDocumentRecord(
          "Project Planning",
        ),
      ).rejects.toThrow(
        "Database connection failed",
      );

      expect(
        mockShareLinkCreate,
      ).not.toHaveBeenCalled();
    });

    it("propagates OWNER share link creation errors", async () => {
      const error = new Error(
        "Failed to create owner link",
      );

      /*
       * Reset the existing successful queue first.
       */
      mockShareLinkCreate.mockReset();

      mockShareLinkCreate.mockRejectedValueOnce(
        error,
      );

      await expect(
        createDocumentRecord(
          "Project Planning",
        ),
      ).rejects.toThrow(
        "Failed to create owner link",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenCalledTimes(1);
    });

    it("propagates EDITOR share link creation errors", async () => {
      const error = new Error(
        "Failed to create editor link",
      );

      /*
       * OWNER succeeds.
       * EDITOR fails.
       */
      mockShareLinkCreate.mockReset();

      mockShareLinkCreate
        .mockResolvedValueOnce(
          mockOwnerShareLink as any,
        )
        .mockRejectedValueOnce(error);

      await expect(
        createDocumentRecord(
          "Project Planning",
        ),
      ).rejects.toThrow(
        "Failed to create editor link",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenCalledTimes(2);
    });

    it("propagates VIEWER share link creation errors", async () => {
      const error = new Error(
        "Failed to create viewer link",
      );

      /*
       * OWNER succeeds.
       * EDITOR succeeds.
       * VIEWER fails.
       */
      mockShareLinkCreate.mockReset();

      mockShareLinkCreate
        .mockResolvedValueOnce(
          mockOwnerShareLink as any,
        )
        .mockResolvedValueOnce(
          mockEditorShareLink as any,
        )
        .mockRejectedValueOnce(error);

      await expect(
        createDocumentRecord(
          "Project Planning",
        ),
      ).rejects.toThrow(
        "Failed to create viewer link",
      );

      expect(
        mockShareLinkCreate,
      ).toHaveBeenCalledTimes(3);
    });
  });

  describe("Edge cases", () => {
    it("handles an empty title", async () => {
      /*
       * Make sure no rejected mock implementation
       * from another test survives.
       */
      mockShareLinkCreate.mockReset();

      mockShareLinkCreate
        .mockResolvedValueOnce(
          mockOwnerShareLink as any,
        )
        .mockResolvedValueOnce(
          mockEditorShareLink as any,
        )
        .mockResolvedValueOnce(
          mockViewerShareLink as any,
        );

      await createDocumentRecord("");

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "",
          }),
        }),
      );
    });

    it("handles a whitespace-only title", async () => {
      mockShareLinkCreate.mockReset();

      mockShareLinkCreate
        .mockResolvedValueOnce(
          mockOwnerShareLink as any,
        )
        .mockResolvedValueOnce(
          mockEditorShareLink as any,
        )
        .mockResolvedValueOnce(
          mockViewerShareLink as any,
        );

      await createDocumentRecord("     ");

      expect(
        mockDocumentCreate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "",
          }),
        }),
      );
    });
  });
});