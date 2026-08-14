import { createDocument } from "@/features/docs/actions/create-document";
import { createDocumentRecord } from "@/features/docs/services/create-document-record";
import { revalidatePath } from "next/cache";
import { titleSchema } from "@/features/docs/validations/documents";

jest.mock(
  "@/features/docs/services/create-document-record",
  () => ({
    createDocumentRecord: jest.fn(),
  }),
);

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock(
  "@/features/docs/validations/documents",
  () => ({
    titleSchema: {
      safeParse: jest.fn(),
    },
  }),
);

describe("createDocument", () => {
  const mockCreateDocumentRecord =
    createDocumentRecord as jest.MockedFunction<
      typeof createDocumentRecord
    >;

  const mockRevalidatePath =
    revalidatePath as jest.MockedFunction<
      typeof revalidatePath
    >;

  const mockTitleSchema =
    titleSchema.safeParse as jest.MockedFunction<
      typeof titleSchema.safeParse
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    it("validates the title from FormData", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "Product Launch Plan",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "Product Launch Plan",
      } as any);

      mockCreateDocumentRecord.mockResolvedValue(
        {} as any,
      );

      await createDocument(undefined, formData);

      expect(
        mockTitleSchema,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockTitleSchema,
      ).toHaveBeenCalledWith(
        "Product Launch Plan",
      );
    });

    it("returns validation errors when the title is invalid", async () => {
      const formData = new FormData();

      formData.set("title", "");

      mockTitleSchema.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              message: "Document title is required",
            },
            {
              message:
                "Title must be at least 2 characters",
            },
          ],
        },
      } as any);

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toEqual({
        message:
          "Missing Fields. Failed to create document. Please check and try again.",
        errors: {
          title: [
            "Document title is required",
            "Title must be at least 2 characters",
          ],
        },
      });

      expect(
        mockCreateDocumentRecord,
      ).not.toHaveBeenCalled();

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();
    });

    it("does not call the document service when validation fails", async () => {
      const formData = new FormData();

      formData.set("title", "");

      mockTitleSchema.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              message: "Title is required",
            },
          ],
        },
      } as any);

      await createDocument(
        undefined,
        formData,
      );

      expect(
        mockCreateDocumentRecord,
      ).not.toHaveBeenCalled();
    });

    it("handles a missing title", async () => {
      const formData = new FormData();

      mockTitleSchema.mockReturnValue({
        success: false,
        error: {
          issues: [
            {
              message: "Please enter a title",
            },
          ],
        },
      } as any);

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toEqual({
        message:
          "Missing Fields. Failed to create document. Please check and try again.",
        errors: {
          title: ["Please enter a title"],
        },
      });
    });
  });

  describe("Successful document creation", () => {
    it("creates a document with the validated title", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "My Collaborative Document",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "My Collaborative Document",
      } as any);

      const mockDocument = {
        document: {
          id: "document-123",
          name: "My Collaborative Document",
        },
        ownerToken: "owner-token-123",
      };

      mockCreateDocumentRecord.mockResolvedValue(
        mockDocument as any,
      );

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(
        mockCreateDocumentRecord,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCreateDocumentRecord,
      ).toHaveBeenCalledWith(
        "My Collaborative Document",
      );

      expect(result).toEqual({
        success: true,
        message: "Document created successfully.",
        errors: "",
        docDetails: mockDocument,
      });
    });

    it("revalidates the documents path after successful creation", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "New Document",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "New Document",
      } as any);

      mockCreateDocumentRecord.mockResolvedValue(
        {
          document: {
            id: "document-123",
          },
          ownerToken: "owner-token",
        } as any,
      );

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

    it("returns the document service response as docDetails", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "Team Planning",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "Team Planning",
      } as any);

      const documentResponse = {
        document: {
          id: "doc-123",
          name: "Team Planning",
        },
        ownerToken: "token-123",
      };

      mockCreateDocumentRecord.mockResolvedValue(
        documentResponse as any,
      );

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result.success).toBe(true);
      expect(result.docDetails).toBe(
        documentResponse,
      );
    });

    it("returns the expected success message", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "Project Notes",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "Project Notes",
      } as any);

      mockCreateDocumentRecord.mockResolvedValue(
        {} as any,
      );

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result.message).toBe(
        "Document created successfully.",
      );
    });
  });

  describe("Service errors", () => {
    it("returns the service error message", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "My Document",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "My Document",
      } as any);

      mockCreateDocumentRecord.mockRejectedValue(
        new Error(
          "Failed to create document record",
        ),
      );

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message:
          "Failed to create document record",
        errors:
          "Failed to create document record",
      });

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();
    });

    it("does not revalidate the documents path when creation fails", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "Failed Document",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "Failed Document",
      } as any);

      mockCreateDocumentRecord.mockRejectedValue(
        new Error("Database error"),
      );

      await createDocument(
        undefined,
        formData,
      );

      expect(
        mockRevalidatePath,
      ).not.toHaveBeenCalled();
    });

    it("handles non-Error thrown values", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "Test Document",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "Test Document",
      } as any);

      mockCreateDocumentRecord.mockRejectedValue(
        "Something went wrong",
      );

      const result = await createDocument(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Something went wrong",
        errors: "Something went wrong",
      });
    });
  });

  describe("Previous state", () => {
    it("accepts a previous state without changing the behavior", async () => {
      const formData = new FormData();

      formData.set(
        "title",
        "Existing State Document",
      );

      mockTitleSchema.mockReturnValue({
        success: true,
        data: "Existing State Document",
      } as any);

      mockCreateDocumentRecord.mockResolvedValue(
        {
          document: {
            id: "doc-123",
          },
          ownerToken: "token-123",
        } as any,
      );

      const previousState = {
        success: false,
        message: "Previous error",
        errors: "Previous error",
      };

      const result = await createDocument(
        previousState,
        formData,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "Document created successfully.",
      );
    });
  });
});