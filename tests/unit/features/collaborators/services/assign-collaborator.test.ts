import prisma from "@/lib/db/prisma";

import { assignCollaborator } from "@/features/collaborators/services/assign-collaborator";

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    documentShareLink: {
      findUnique: jest.fn(),
    },
    document: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    documentCollaborator: {
      upsert: jest.fn(),
    },
  },
}));

describe("assignCollaborator", () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;

  const validSession = {
    userId: "user-123",
  };

  const validDocumentId = "document-123";
  const validDocumentToken = "token-123";

  const mockDocumentShareLink = {
    role: "EDITOR",
  };

  const mockDocument = {
    creatorId: "creator-123",
  };

  const mockCollaboratorUser = {
    id: "user-123",
  };

  const mockCollaborator = {
    id: "collaborator-123",
    documentId: validDocumentId,
    userId: "user-123",
    role: "EDITOR",
    invitedBy: "creator-123",
    user: {
      id: "user-123",
      email: "user@example.com",
      fullName: "Test User",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    it("throws when document id is missing", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      await expect(
        assignCollaborator(
          "",
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");

      expect(
        mockPrisma.documentShareLink.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          token: validDocumentToken,
        },
      });
    });

    it("throws when user id is missing", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          { userId: "" },
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");

      expect(
        mockPrisma.document.findUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockPrisma.user.findUnique,
      ).not.toHaveBeenCalled();
    });

    it("throws when user id is not a string", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          { userId: 123 } as any,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");

      expect(
        mockPrisma.document.findUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockPrisma.user.findUnique,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Share link role", () => {
    it("returns undefined when the share link does not exist", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        null,
      );

      const result = await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(result).toBeUndefined();

      expect(
        mockPrisma.document.findUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockPrisma.user.findUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).not.toHaveBeenCalled();
    });

    it("returns undefined for an invalid role", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue({
        role: "ADMIN",
      } as any);

      const result = await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(result).toBeUndefined();

      expect(
        mockPrisma.document.findUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockPrisma.user.findUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).not.toHaveBeenCalled();
    });

    it("returns undefined when the role is missing", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue({
        role: null,
      } as any);

      const result = await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(result).toBeUndefined();

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).not.toHaveBeenCalled();
    });

    it("accepts EDITOR role", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue({
        role: "EDITOR",
      } as any);

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      const result = await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(result).toEqual(mockCollaborator);

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).toHaveBeenCalled();
    });

    it("accepts VIEWER role", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue({
        role: "VIEWER",
      } as any);

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockResolvedValue({
        ...mockCollaborator,
        role: "VIEWER",
      } as any);

      const result = await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(result).toEqual({
        ...mockCollaborator,
        role: "VIEWER",
      });
    });

    it("normalizes lowercase roles", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue({
        role: "editor",
      } as any);

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            role: "editor",
          }),
          update: expect.objectContaining({
            role: "editor",
          }),
        }),
      );
    });

    it("trims whitespace from the role before validating it", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue({
        role: "  VIEWER  ",
      } as any);

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).toHaveBeenCalled();
    });
  });

  describe("Document lookup", () => {
    beforeEach(() => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );
    });

    it("throws when the document does not exist", async () => {
      mockPrisma.document.findUnique.mockResolvedValue(
        null,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");

      expect(
        mockPrisma.document.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: validDocumentId,
        },
        select: {
          creatorId: true,
        },
      });

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).not.toHaveBeenCalled();
    });

    it("looks up the document using the supplied document id", async () => {
      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.document.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: validDocumentId,
        },
        select: {
          creatorId: true,
        },
      });
    });
  });

  describe("Collaborator user lookup", () => {
    beforeEach(() => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );
    });

    it("throws when the collaborator user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");

      expect(
        mockPrisma.user.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: validSession.userId,
        },
        select: {
          id: true,
        },
      });

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).not.toHaveBeenCalled();
    });

    it("looks up the collaborator using the session user id", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.user.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        select: {
          id: true,
        },
      });
    });
  });

  describe("Collaborator upsert", () => {
    beforeEach(() => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );
    });

    it("creates or updates the collaborator with the correct data", async () => {
      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).toHaveBeenCalledWith({
        where: {
          documentId_userId: {
            documentId: validDocumentId,
            userId: validSession.userId,
          },
        },
        create: {
          documentId: validDocumentId,
          userId: validSession.userId,
          role: "EDITOR",
          invitedBy: "creator-123",
        },
        update: {
          role: "EDITOR",
          invitedBy: "creator-123",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });
    });

    it("returns the created or updated collaborator", async () => {
      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      const result = await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(result).toEqual(mockCollaborator);
    });

    it("uses the document creator as invitedBy", async () => {
      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            invitedBy: "creator-123",
          }),
          update: expect.objectContaining({
            invitedBy: "creator-123",
          }),
        }),
      );
    });

    it("includes collaborator user information in the result", async () => {
      mockPrisma.documentCollaborator.upsert.mockResolvedValue(
        mockCollaborator as any,
      );

      await assignCollaborator(
        validDocumentId,
        validSession,
        validDocumentToken,
      );

      expect(
        mockPrisma.documentCollaborator.upsert,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        }),
      );
    });
  });

  describe("Error handling", () => {
    it("converts Prisma share-link errors into a generic error", async () => {
      mockPrisma.documentShareLink.findUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");
    });

    it("converts document lookup errors into a generic error", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      mockPrisma.document.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");
    });

    it("converts user lookup errors into a generic error", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");
    });

    it("converts upsert errors into a generic error", async () => {
      mockPrisma.documentShareLink.findUnique.mockResolvedValue(
        mockDocumentShareLink as any,
      );

      mockPrisma.document.findUnique.mockResolvedValue(
        mockDocument as any,
      );

      mockPrisma.user.findUnique.mockResolvedValue(
        mockCollaboratorUser as any,
      );

      mockPrisma.documentCollaborator.upsert.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        assignCollaborator(
          validDocumentId,
          validSession,
          validDocumentToken,
        ),
      ).rejects.toThrow("Failed to assign collaborator");
    });
  });
});