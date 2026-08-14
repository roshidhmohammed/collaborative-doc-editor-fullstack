"use server";

import { createDocumentState } from "@/shared/types/actions";
import { revalidatePath } from "next/cache";
import { titleSchema } from "../validations/documents";
import { createDocumentRecord } from "../services/create-document-record";

export async function createDocument(
  prevState: createDocumentState | undefined,
  formData: FormData,
): Promise<createDocumentState> {
  const title = formData.get("title");

  const validatedTitle = titleSchema.safeParse(title);

  if (!validatedTitle.success) {
    const titleErrors = validatedTitle.error.issues.map(
      (issue) => issue.message,
    );
    return {
      message:
        "Missing Fields. Failed to create document. Please check and try again.",
      errors: {
        title: titleErrors,
      },
    };
  }

  const documentTitle = validatedTitle.data;

  try {
    const res = await createDocumentRecord(documentTitle);
    revalidatePath("/documents");
    return {
      success: true,
      message: "Document created successfully.",
      errors: "",
      docDetails: res,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
      errors: error instanceof Error ? error.message : String(error),
    };
  }
}
