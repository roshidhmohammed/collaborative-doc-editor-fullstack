import { getDocumentDetails } from "@/features/docEditor/services/doc-editor";
import { verifySession } from "@/lib/dal/auth";
import prisma from "@/lib/db/prisma";

jest.mock("@/lib/dal/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    documentShareLink: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getDocumentDetails", () => {
  const mockVerifySession =
    verifySession as jest.MockedFunction<typeof verifySession>;

  const mockFindUnique =
    prisma.documentShareLink.findUnique as jest.MockedFunction<
      typeof prisma.documentShareLink.findUnique
    >;

  const mockDocument = {
    id: "document-123",
    name: "Collaborative Document",
    content: "Document content",
    creatorId: "creator-123",
    creatorLink: "creator-token",
    creator: {
      id: "creator-123",
      email: "creator@example.com",
      fullName: "Document Creator",
    },
    collaborators: [
      {
        id: "collaborator-123",
        role: "EDITOR",
        invitedBy: "creator-123",
        joinedAt: new Date("2026-08-01T10:00:00.000Z"),
        user: {
          id: "user-123",
          email: "user@example.com",
          fullName: "Test User",
        },
      },
    ],
  };

  const mockShareLinks = [
    {
      id: "share-link-1",
      token: "viewer-token",
      documentId: "document-123",
      role: "VIEWER",
      createdById: "creator-123",
      expiresAt: null,
      isActive: true,
      createdAt: new Date("2026-08-01T09:00:00.000Z"),
    },
    {
      id: "share-link-2",
      token: "editor-token",
      documentId: "document-123",
      role: "EDITOR",
      createdById: "creator-123",
      expiresAt: null,
      isActive: true,
      createdAt: new Date("2026-08-01T09:30:00.000Z"),
    },
  ];

  const mockShareLinkRecord = {
    id: "share-link-1",
    token: "viewer-token",
    documentId: "document-123",
    role: "VIEWER",
    createdById: "creator-123",
    expiresAt: null,
    isActive: true,
    createdAt: new Date("2026-08-01T09:00:00.000Z"),

    document: {
      ...mockDocument,
      shareLinks: mockShareLinks,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockVerifySession.mockResolvedValue(undefined as never);
  });

  describe("Authentication", () => {
    it("verifies the user session before accessing the document", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      await getDocumentDetails("viewer-token");

      expect(mockVerifySession).toHaveBeenCalledTimes(1);
    });

    it("does not query Prisma when session verification fails", async () => {
      mockVerifySession.mockRejectedValue(
        new Error("Unauthorized"),
      );

      await expect(
        getDocumentDetails("viewer-token"),
      ).rejects.toThrow("Failed to fetch document");

      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("Document token validation", () => {
    it("throws a normalized error when document token is missing", async () => {
      await expect(
        getDocumentDetails(""),
      ).rejects.toThrow(
        "Failed to fetch document",
      );

      expect(mockVerifySession).toHaveBeenCalledTimes(1);
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it("does not query Prisma for an empty token", async () => {
      await expect(
        getDocumentDetails(""),
      ).rejects.toThrow();

      expect(
        mockFindUnique,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Prisma document lookup", () => {
    it("finds the document share link using the provided token", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      await getDocumentDetails("viewer-token");

      expect(mockFindUnique).toHaveBeenCalledTimes(1);

      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            token: "viewer-token",
          },
        }),
      );
    });

    it("returns an error when the share link does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        getDocumentDetails("invalid-token"),
      ).rejects.toThrow(
        "Failed to fetch document",
      );

      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            token: "invalid-token",
          },
        }),
      );
    });

    it("normalizes Prisma lookup errors", async () => {
      mockFindUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        getDocumentDetails("viewer-token"),
      ).rejects.toThrow(
        "Failed to fetch document",
      );
    });
  });

  describe("Prisma query", () => {
    it("requests the expected document share link fields", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      await getDocumentDetails("viewer-token");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          token: "viewer-token",
        },
        select: expect.objectContaining({
          id: true,
          token: true,
          documentId: true,
          role: true,
          createdById: true,
          expiresAt: true,
          isActive: true,
          createdAt: true,
          document: expect.any(Object),
        }),
      });
    });

    it("requests creator information", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      await getDocumentDetails("viewer-token");

      const call =
        mockFindUnique.mock.calls[0][0] as any;

      expect(
        call.select.document.include.creator,
      ).toEqual({
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });
    });

    it("requests collaborator information", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      await getDocumentDetails("viewer-token");

      const call =
        mockFindUnique.mock.calls[0][0] as any;

      expect(
        call.select.document.include.collaborators,
      ).toEqual({
        select: {
          id: true,
          role: true,
          invitedBy: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      });
    });

    it("requests share links ordered by creation date", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      await getDocumentDetails("viewer-token");

      const call =
        mockFindUnique.mock.calls[0][0] as any;

      expect(
        call.select.document.include.shareLinks,
      ).toEqual({
        select: {
          id: true,
          token: true,
          documentId: true,
          role: true,
          createdById: true,
          expiresAt: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    });
  });

  describe("Response transformation", () => {
    it("returns the document", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(result.document).toEqual(
        mockDocument,
      );
    });

    it("returns document share links separately", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(
        result.documentShareLinks,
      ).toEqual(mockShareLinks);
    });

    it("returns the current document share link separately", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(
        result.currentDocumentShareLink,
      ).toEqual({
        id: "share-link-1",
        token: "viewer-token",
        documentId: "document-123",
        role: "VIEWER",
        createdById: "creator-123",
        expiresAt: null,
        isActive: true,
        createdAt: new Date(
          "2026-08-01T09:00:00.000Z",
        ),
      });
    });

    it("does not include shareLinks inside the returned document", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(
        (result.document as any).shareLinks,
      ).toBeUndefined();
    });

    it("preserves collaborators inside the document", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(
        result.document.collaborators,
      ).toEqual(mockDocument.collaborators);
    });

    it("preserves creator information inside the document", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(
        result.document.creator,
      ).toEqual(mockDocument.creator);
    });
  });

  describe("Successful response", () => {
    it("returns the complete transformed response", async () => {
      mockFindUnique.mockResolvedValue(
        mockShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("viewer-token");

      expect(result).toEqual({
        document: mockDocument,
        documentShareLinks: mockShareLinks,
        currentDocumentShareLink: {
          id: "share-link-1",
          token: "viewer-token",
          documentId: "document-123",
          role: "VIEWER",
          createdById: "creator-123",
          expiresAt: null,
          isActive: true,
          createdAt: new Date(
            "2026-08-01T09:00:00.000Z",
          ),
        },
      });
    });

    it("returns the correct data for an editor share token", async () => {
      const editorShareLinkRecord = {
        ...mockShareLinkRecord,
        id: "share-link-2",
        token: "editor-token",
        role: "EDITOR",
      };

      mockFindUnique.mockResolvedValue(
        editorShareLinkRecord as any,
      );

      const result =
        await getDocumentDetails("editor-token");

      expect(
        result.currentDocumentShareLink,
      ).toMatchObject({
        id: "share-link-2",
        token: "editor-token",
        role: "EDITOR",
      });

      expect(result.document).toEqual(
        mockDocument,
      );

      expect(
        result.documentShareLinks,
      ).toEqual(mockShareLinks);
    });
  });

  describe("Error handling", () => {
    it("returns the same normalized error for unexpected errors", async () => {
      mockFindUnique.mockRejectedValue(
        new Error("Unexpected database error"),
      );

      await expect(
        getDocumentDetails("viewer-token"),
      ).rejects.toThrow(
        "Failed to fetch document",
      );
    });

    it("normalizes non-Error thrown values", async () => {
      mockFindUnique.mockRejectedValue(
        "Database failure",
      );

      await expect(
        getDocumentDetails("viewer-token"),
      ).rejects.toThrow(
        "Failed to fetch document",
      );
    });
  });
});