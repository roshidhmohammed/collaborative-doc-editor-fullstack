import prisma from "@/lib/db/prisma";

type ShareLinkRole =
  | "OWNER"
  | "EDITOR"
  | "VIEWER";

interface CreateShareLinkOptions {
  documentId: string;
  createdById: string;
  role: ShareLinkRole;
  token?: string;
  isActive?: boolean;
  expiresAt?: Date | null;
}

export async function createShareLink(
  options: CreateShareLinkOptions,
) {
  return prisma.documentShareLink.create({
    data: {
      documentId: options.documentId,
      createdById: options.createdById,
      role: options.role,

      token:
        options.token ??
        `integration-token-${crypto.randomUUID()}`,

      isActive:
        options.isActive ?? true,

      expiresAt:
        options.expiresAt ?? null,
    },
  });
}