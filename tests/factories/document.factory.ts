import prisma from "@/lib/db/prisma";

interface CreateDocumentOptions {
  creatorId: string;
  name?: string;
}

export async function createDocument(
  options: CreateDocumentOptions,
) {
  const {
    creatorId,
    name = `Integration Document ${crypto.randomUUID()}`,
  } = options;

  const document = await prisma.document.create({
    data: {
      name,
      creatorId,

      versions: {
        create: {
          version: 1,

          createdBy: {
            connect: {
              id: creatorId,
            },
          },
        },
      },
    },
  });

  return document;
}