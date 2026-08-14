import prisma from "@/lib/db/prisma";

type CollaboratorRole =
  | "EDITOR"
  | "VIEWER";

interface CreateCollaboratorOptions {
  documentId: string;
  userId: string;
  role: CollaboratorRole;
}

export async function createCollaborator(
  options: CreateCollaboratorOptions,
) {
  return prisma.documentCollaborator.create({
    data: {
      documentId: options.documentId,
      userId: options.userId,
      role: options.role,
    },
  });
}