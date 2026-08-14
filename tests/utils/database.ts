import prisma from "@/lib/db/prisma";

/**
 * Removes all data owned by a specific test user.
 *
 * This is intentionally scoped to one user so integration
 * tests can safely run without deleting another test's data.
 */
export async function cleanTestUsers(
  userIds: string[],
) {
  if (userIds.length === 0) {
    return;
  }

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

export async function cleanTestDocuments(
  documentIds: string[],
) {
  if (documentIds.length === 0) {
    return;
  }

  await prisma.$transaction([
    prisma.documentShareLink.deleteMany({
      where: {
        documentId: {
          in: documentIds,
        },
      },
    }),

    prisma.documentCollaborator.deleteMany({
      where: {
        documentId: {
          in: documentIds,
        },
      },
    }),

    prisma.documentVersion.deleteMany({
      where: {
        documentId: {
          in: documentIds,
        },
      },
    }),

    prisma.document.deleteMany({
      where: {
        id: {
          in: documentIds,
        },
      },
    }),
  ]);
}

export async function cleanUserData(userId: string) {
  await prisma.$transaction([
    prisma.documentShareLink.deleteMany({
      where: {
        createdById: userId,
      },
    }),

    prisma.documentVersion.deleteMany({
      where: {
        createdById: userId,
      },
    }),

    prisma.document.deleteMany({
      where: {
        creatorId: userId,
      },
    }),

    prisma.user.delete({
      where: {
        id: userId,
      },
    }),
  ]);
}

export async function cleanDatabase() {
  await prisma.$transaction([
    prisma.documentShareLink.deleteMany(),
    prisma.documentCollaborator.deleteMany(),
    prisma.documentVersion.deleteMany(),
    prisma.document.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
