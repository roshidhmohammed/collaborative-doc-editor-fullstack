import prisma from "@/lib/db/prisma";

export async function getDocumentById(documentId: string) {
  return prisma.document.findUnique({
    where: {
      id: documentId,
    },
    select: {
      name: true,
    },
  });
}