import { getAllDocuments } from "@/features/docs/services/get-all-documents";
import { verifySession } from "@/lib/dal/auth";
import prisma from "@/lib/db/prisma";

jest.mock("@/lib/dal/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    document: {
      findMany: jest.fn(),
    },
  },
}));

describe("getAllDocuments", () => {
  const mockVerifySession =
    verifySession as jest.MockedFunction<typeof verifySession>;

  const mockDocumentFindMany =
    prisma.document.findMany as jest.MockedFunction<
      typeof prisma.document.findMany
    >;

  const session = {
    userId: "user-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockVerifySession.mockResolvedValue(session as any);
    mockDocumentFindMany.mockResolvedValue([]);
  });

  describe("Authentication", () => {
    it("verifies the current session", async () => {
      await getAllDocuments();

      expect(mockVerifySession).toHaveBeenCalledTimes(1);
    });

    it("does not query the database when session verification fails", async () => {
      mockVerifySession.mockRejectedValue(
        new Error("Unauthorized"),
      );

      await expect(getAllDocuments()).rejects.toThrow(
        "Unauthorized",
      );

      expect(mockDocumentFindMany).not.toHaveBeenCalled();
    });
  });

  describe("Database query", () => {
    it("queries documents using the authenticated user id", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledTimes(1);

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                creatorId: "user-123",
              },
              {
                collaborators: {
                  some: {
                    userId: "user-123",
                  },
                },
              },
            ],
          },
        }),
      );
    });

    it("includes creator information", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            creator: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          }),
        }),
      );
    });

    it("includes collaborator information", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            collaborators: {
              select: {
                id: true,
                userId: true,
                role: true,
                joinedAt: true,
              },
            },
          }),
        }),
      );
    });

    it("includes active share links", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            shareLinks: expect.objectContaining({
              where: expect.objectContaining({
                isActive: true,
              }),
            }),
          }),
        }),
      );
    });

    it("filters out expired share links", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            shareLinks: expect.objectContaining({
              where: expect.objectContaining({
                OR: [
                  {
                    expiresAt: null,
                  },
                  {
                    expiresAt: {
                      gt: expect.any(Date),
                    },
                  },
                ],
              }),
            }),
          }),
        }),
      );
    });

    it("selects share link role and token", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            shareLinks: expect.objectContaining({
              select: {
                role: true,
                token: true,
              },
            }),
          }),
        }),
      );
    });

    it("orders share links by createdAt descending", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            shareLinks: expect.objectContaining({
              orderBy: {
                createdAt: "desc",
              },
            }),
          }),
        }),
      );
    });

    it("orders documents by updatedAt descending", async () => {
      await getAllDocuments();

      expect(mockDocumentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            updatedAt: "desc",
          },
        }),
      );
    });
  });

  describe("Owner documents", () => {
    it("assigns OWNER role to a document created by the current user", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "My Document",
          creatorId: "user-123",
          creator: {
            id: "user-123",
            email: "user@example.com",
            fullName: "Test User",
          },
          collaborators: [],
          shareLinks: [
            {
              role: "OWNER",
              token: "owner-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result).toHaveLength(1);

      expect(result[0].associatedRoleToken).toBe(
        "owner-token",
      );
    });

    it("uses the OWNER share link token", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "My Document",
          creatorId: "user-123",
          creator: {},
          collaborators: [],
          shareLinks: [
            {
              role: "OWNER",
              token: "owner-token",
            },
            {
              role: "EDITOR",
              token: "editor-token",
            },
            {
              role: "VIEWER",
              token: "viewer-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0].associatedRoleToken).toBe(
        "owner-token",
      );
    });
  });

  describe("Collaborator documents", () => {
    it("uses the EDITOR share link for an editor collaborator", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-456",
          name: "Shared Document",
          creatorId: "another-user",
          creator: {
            id: "another-user",
            email: "owner@example.com",
            fullName: "Document Owner",
          },
          collaborators: [
            {
              id: "collaborator-123",
              userId: "user-123",
              role: "EDITOR",
              joinedAt: new Date(),
            },
          ],
          shareLinks: [
            {
              role: "EDITOR",
              token: "editor-token",
            },
            {
              role: "VIEWER",
              token: "viewer-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0].associatedRoleToken).toBe(
        "editor-token",
      );
    });

    it("uses the VIEWER share link for a viewer collaborator", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-456",
          name: "Shared Document",
          creatorId: "another-user",
          creator: {},
          collaborators: [
            {
              id: "collaborator-123",
              userId: "user-123",
              role: "VIEWER",
              joinedAt: new Date(),
            },
          ],
          shareLinks: [
            {
              role: "VIEWER",
              token: "viewer-token",
            },
            {
              role: "EDITOR",
              token: "editor-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0].associatedRoleToken).toBe(
        "viewer-token",
      );
    });
  });

  describe("Share link resolution", () => {
    it("returns null when no share link matches the user's role", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "Document",
          creatorId: "user-123",
          creator: {},
          collaborators: [],
          shareLinks: [
            {
              role: "EDITOR",
              token: "editor-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0].associatedRoleToken).toBeNull();
    });

    it("returns null when there are no share links", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "Document",
          creatorId: "user-123",
          creator: {},
          collaborators: [],
          shareLinks: [],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0].associatedRoleToken).toBeNull();
    });

    it("selects the share link matching the associated role", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "Document",
          creatorId: "another-user",
          creator: {},
          collaborators: [
            {
              id: "collaborator-123",
              userId: "user-123",
              role: "EDITOR",
              joinedAt: new Date(),
            },
          ],
          shareLinks: [
            {
              role: "VIEWER",
              token: "viewer-token",
            },
            {
              role: "EDITOR",
              token: "editor-token",
            },
            {
              role: "OWNER",
              token: "owner-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0].associatedRoleToken).toBe(
        "editor-token",
      );
    });
  });

  describe("Multiple documents", () => {
    it("returns multiple documents", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-1",
          name: "Owned Document",
          creatorId: "user-123",
          creator: {},
          collaborators: [],
          shareLinks: [
            {
              role: "OWNER",
              token: "owner-token",
            },
          ],
        },
        {
          id: "document-2",
          name: "Edited Document",
          creatorId: "another-user",
          creator: {},
          collaborators: [
            {
              id: "collaborator-2",
              userId: "user-123",
              role: "EDITOR",
              joinedAt: new Date(),
            },
          ],
          shareLinks: [
            {
              role: "EDITOR",
              token: "editor-token",
            },
          ],
        },
        {
          id: "document-3",
          name: "Viewed Document",
          creatorId: "another-user",
          creator: {},
          collaborators: [
            {
              id: "collaborator-3",
              userId: "user-123",
              role: "VIEWER",
              joinedAt: new Date(),
            },
          ],
          shareLinks: [
            {
              role: "VIEWER",
              token: "viewer-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result).toHaveLength(3);

      expect(result[0].associatedRoleToken).toBe(
        "owner-token",
      );

      expect(result[1].associatedRoleToken).toBe(
        "editor-token",
      );

      expect(result[2].associatedRoleToken).toBe(
        "viewer-token",
      );
    });
  });

  describe("Empty results", () => {
    it("returns an empty array when no documents exist", async () => {
      mockDocumentFindMany.mockResolvedValue([]);

      const result = await getAllDocuments();

      expect(result).toEqual([]);
    });
  });

  describe("Result transformation", () => {
    it("removes shareLinks from the returned documents", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "Document",
          creatorId: "user-123",
          creator: {},
          collaborators: [],
          shareLinks: [
            {
              role: "OWNER",
              token: "owner-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0]).not.toHaveProperty("shareLinks");
    });

    it("preserves document properties", async () => {
      mockDocumentFindMany.mockResolvedValue([
        {
          id: "document-123",
          name: "Important Document",
          creatorId: "user-123",
          creator: {
            id: "user-123",
            email: "user@example.com",
            fullName: "Test User",
          },
          collaborators: [],
          shareLinks: [
            {
              role: "OWNER",
              token: "owner-token",
            },
          ],
        },
      ] as any);

      const result = await getAllDocuments();

      expect(result[0]).toMatchObject({
        id: "document-123",
        name: "Important Document",
        creatorId: "user-123",
        creator: {
          id: "user-123",
          email: "user@example.com",
          fullName: "Test User",
        },
        collaborators: [],
      });
    });
  });

  describe("Errors", () => {
    it("propagates database errors", async () => {
      mockDocumentFindMany.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(getAllDocuments()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});