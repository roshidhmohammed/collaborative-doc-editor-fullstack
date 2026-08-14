"use server";

import { verifySession } from "@/lib/dal/auth";
import prisma from "@/lib/db/prisma";

export async function getAllDocuments() {
  try {
    const session = await verifySession();
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          {
            creatorId: session.userId,
          },
          {
            collaborators: {
              some: {
                userId: session.userId,
              },
            },
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        collaborators: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
          },
        },
        shareLinks: {
          where: {
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          select: {
            role: true,
            token: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const data = documents.map(({ shareLinks, ...document }) => {
      const associatedRole =
        document.creatorId === session.userId
          ? "OWNER"
          : document.collaborators.find(
              (collaborator) => collaborator.userId === session.userId,
            )?.role;

      const associatedRoleToken =
        shareLinks.find((shareLink) => shareLink.role === associatedRole)
          ?.token ?? null;

      return {
        ...document,
        associatedRoleToken,
      };
    });
    return data;
  } catch (error) {
    throw error;
  }
}
