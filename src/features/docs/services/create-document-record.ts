"use server";

import { verifySession } from "@/lib/dal/auth";
import prisma from "@/lib/db/prisma";
import { generateShareToken } from "../utils/generateShareToken";

const createShareLink = async (documentId: string, createdById: string) => {
  const editorToken = generateShareToken();
  const viewerToken = generateShareToken();
  const ownerToken = generateShareToken();

  const ownerShareLink = await prisma.documentShareLink.create({
    data: {
      token: ownerToken,
      role: "OWNER",
      documentId,
      createdById,
    },
  });

  const editorShareLink = await prisma.documentShareLink.create({
    data: {
      token: editorToken,
      role: "EDITOR",
      documentId,
      createdById,
    },
  });

  const viewerShareLink = await prisma.documentShareLink.create({
    data: {
      token: viewerToken,
      role: "VIEWER",
      documentId,
      createdById,
    },
  });

  return {
    editorShareLink,
    viewerShareLink,
    ownerShareLink,
  };
};
export async function createDocumentRecord(title: string) {
  try {
    const session = await verifySession();

    const document = await prisma.document.create({
      data: {
        name: title?.trim(),
        creatorId: String(session.userId),
        versions: {
          create: {
            version: 1,
            createdBy: {
              connect: {
                id: String(session.userId),
              },
            },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    const share = await createShareLink(document.id, String(session.userId));

    const ownerToken = share.ownerShareLink.token;

    return { document, ownerToken };
  } catch (error) {
    throw error;
  }
}
