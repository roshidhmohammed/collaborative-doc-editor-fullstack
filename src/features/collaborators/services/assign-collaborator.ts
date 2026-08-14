import prisma from "@/lib/db/prisma";
import { Session } from "../types/collaborators";

export async function assignCollaborator(
  documentId: string,
  session: Session,
  documentToken: string,
) {
  try {
    const userId = session?.userId;
    const docToken = await prisma.documentShareLink.findUnique({
      where: {
        token: documentToken,
      },
    });
    if (!documentId) {
      throw new Error("Document id is required");
    }

    if (!userId || typeof userId !== "string") {
      throw new Error("Collaborator user id is required");
    }

    const normalizedRole =
      typeof docToken?.role === "string"
        ? docToken?.role.trim().toUpperCase()
        : "";

    if (!["EDITOR", "VIEWER"].includes(normalizedRole)) {
      return;
    }

    const [document, collaboratorUser] = await Promise.all([
      prisma.document.findUnique({
        where: {
          id: documentId,
        },
        select: {
          creatorId: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!document) {
      throw new Error("Document not found");
    }

    if (!collaboratorUser) {
      throw new Error("Collaborator user not found");
    }

    const collaborator = await prisma.documentCollaborator.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
      create: {
        documentId,
        userId,
        role: docToken?.role,
        invitedBy: document.creatorId,
      },
      update: {
        role: docToken?.role,
        invitedBy: document.creatorId,
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
    return collaborator;
  } catch (error) {
    throw Error("Failed to assign collaborator");
  }
}
