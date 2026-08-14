import prisma from "@/lib/db/prisma";
import { getDocumentById } from "@/features/docs/services/get-document";

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    document: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getDocumentById", () => {
  const mockFindUnique =
    prisma.document.findUnique as jest.MockedFunction<
      typeof prisma.document.findUnique
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful retrieval", () => {
    it("returns the document name when the document exists", async () => {
      mockFindUnique.mockResolvedValue({
        name: "Project Planning",
      } as any);

      const result = await getDocumentById("document-123");

      expect(result).toEqual({
        name: "Project Planning",
      });
    });

    it("queries Prisma with the provided document ID", async () => {
      mockFindUnique.mockResolvedValue({
        name: "Project Planning",
      } as any);

      await getDocumentById("document-123");

      expect(mockFindUnique).toHaveBeenCalledTimes(1);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: "document-123",
        },
        select: {
          name: true,
        },
      });
    });

    it("returns only the selected name field", async () => {
      mockFindUnique.mockResolvedValue({
        name: "Project Planning",
      } as any);

      const result = await getDocumentById("document-123");

      expect(result).toEqual({
        name: "Project Planning",
      });

      expect(result).not.toHaveProperty("id");
      expect(result).not.toHaveProperty("creatorId");
      expect(result).not.toHaveProperty("content");
    });
  });

  describe("Document not found", () => {
    it("returns null when the document does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getDocumentById("non-existent-document");

      expect(result).toBeNull();
    });

    it("still queries Prisma with the requested document ID", async () => {
      mockFindUnique.mockResolvedValue(null);

      await getDocumentById("non-existent-document");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: "non-existent-document",
        },
        select: {
          name: true,
        },
      });
    });
  });

  describe("Input handling", () => {
    it("passes the document ID without modifying it", async () => {
      mockFindUnique.mockResolvedValue({
        name: "My Document",
      } as any);

      const documentId = "doc-abc-123";

      await getDocumentById(documentId);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: documentId,
        },
        select: {
          name: true,
        },
      });
    });

    it("handles an empty document ID according to Prisma behavior", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getDocumentById("");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: "",
        },
        select: {
          name: true,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe("Database errors", () => {
    it("propagates Prisma errors", async () => {
      const error = new Error(
        "Database connection failed",
      );

      mockFindUnique.mockRejectedValue(error);

      await expect(
        getDocumentById("document-123"),
      ).rejects.toThrow("Database connection failed");
    });

    it("does not swallow database errors", async () => {
      const error = new Error("Prisma query failed");

      mockFindUnique.mockRejectedValue(error);

      await expect(
        getDocumentById("document-123"),
      ).rejects.toBe(error);
    });
  });
});