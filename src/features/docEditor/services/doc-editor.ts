"use server";

import { verifySession } from "@/lib/dal/auth";
import prisma from "@/lib/db/prisma";

export async function getDocumentDetails(documentToken: string) {
  try {
    await verifySession();
    if (!documentToken) {
      throw new Error("Document token is required");
    }

    const shareLinkRecord = await prisma.documentShareLink.findUnique({
      where: {
        token: documentToken,
      },
      select: {
        id: true,
        token: true,
        documentId: true,
        role: true,
        createdById: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
        document: {
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
                role: true,
                invitedBy: true,
                joinedAt: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                  },
                },
              },
              orderBy: {
                joinedAt: "asc",
              },
            },
            shareLinks: {
              select: {
                id: true,
                token: true,
                documentId: true,
                role: true,
                createdById: true,
                expiresAt: true,
                isActive: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!shareLinkRecord) {
      throw new Error("Document not found or access denied");
    }

    const {
      document: { shareLinks: documentShareLinks, ...document },
      ...currentDocumentShareLink
    } = shareLinkRecord;

    const data = {
      document,
      documentShareLinks,
      currentDocumentShareLink,
    };

    return data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
}
