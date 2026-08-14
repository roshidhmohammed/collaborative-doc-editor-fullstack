import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import {
  createCookieStore,
} from "../../mocks/next/headers.mock";

import {
  mockRedirect,
} from "../../mocks/next/navigation.mock";

import {
  createUser,
} from "../../factories/user.factory";

import {
  createDocument,
} from "../../factories/document.factory";

import {
  createShareLink,
} from "../../factories/share-link.factory";

import {
  cleanDatabase,
  disconnectDatabase,
} from "../../utils/database";

import {
  setAuthenticatedSession,
} from "../../utils/auth";

/**
 * ---------------------------------------------------------
 * Request-scoped mocks
 * ---------------------------------------------------------
 */

const cookieStore =
  createCookieStore();

const mockCookies =
  jest.fn();

jest.unstable_mockModule(
  "next/headers",
  () => ({
    cookies: mockCookies,
  }),
);

jest.unstable_mockModule(
  "next/navigation",
  () => ({
    redirect: mockRedirect,
  }),
);

/**
 * IMPORTANT:
 *
 * Application modules that import next/headers
 * must be imported AFTER unstable_mockModule().
 */

const {
  verifySession,
} = await import(
  "@/lib/dal/auth"
);

const {
  assignCollaborator,
} = await import(
  "@/features/collaborators/services/assign-collaborator"
);

/**
 * ---------------------------------------------------------
 * Test suite
 * ---------------------------------------------------------
 */

describe(
  "Assign Collaborator Integration",
  () => {
    let owner: Awaited<
      ReturnType<typeof createUser>
    >;

    let collaborator: Awaited<
      ReturnType<typeof createUser>
    >;

    let document: Awaited<
      ReturnType<typeof createDocument>
    >;

    beforeEach(async () => {
      jest.clearAllMocks();

      cookieStore.clear();

      mockCookies.mockResolvedValue(
        cookieStore,
      );

      owner =
        await createUser();

      collaborator =
        await createUser();

      document =
        await createDocument({
          creatorId:
            owner.user.id,

          name:
            "Integration Test Document",
        });
    });

    afterEach(async () => {
      cookieStore.clear();

      await cleanDatabase();
    });

    afterAll(async () => {
      await disconnectDatabase();
    });

    /**
     * -------------------------------------------------------
     * Helpers
     * -------------------------------------------------------
     */

    async function authenticate(
      userId: string,
    ) {
      await setAuthenticatedSession(
        cookieStore,
        userId,
      );

      return verifySession();
    }

    async function createShareToken(
      role:
        | "OWNER"
        | "EDITOR"
        | "VIEWER",
    ) {
      const token =
        `${role.toLowerCase()}-${crypto.randomUUID()}`;

      await createShareLink({
        documentId:
          document.id,

        createdById:
          owner.user.id,

        role,

        token,
      });

      return token;
    }

    /**
     * =======================================================
     * VERIFY SESSION
     * =======================================================
     */

    describe(
      "session authorization",
      () => {
        it(
          "authenticates a valid session",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            expect(session).toEqual({
              isAuth: true,
              userId:
                collaborator.user.id,
            });
          },
        );

        it(
          "redirects unauthenticated users to login",
          async () => {
            cookieStore.clear();

            await expect(
              verifySession(),
            ).rejects.toThrow(
              "REDIRECT:/login",
            );

            expect(
              mockRedirect,
            ).toHaveBeenCalledWith(
              "/login",
            );
          },
        );

        it(
          "redirects users with an invalid session",
          async () => {
            cookieStore.set(
              "session",
              "invalid-session-token",
            );

            await expect(
              verifySession(),
            ).rejects.toThrow(
              "REDIRECT:/login",
            );

            expect(
              mockRedirect,
            ).toHaveBeenCalledWith(
              "/login",
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * EDITOR
     * =======================================================
     */

    describe(
      "editor permissions",
      () => {
        it(
          "assigns an authenticated user as EDITOR",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const token =
              await createShareToken(
                "EDITOR",
              );

            const result =
              await assignCollaborator(
                document.id,
                session,
                token,
              );

            expect(result).toEqual(
              expect.objectContaining({
                documentId:
                  document.id,

                userId:
                  collaborator.user.id,

                role: "EDITOR",

                invitedBy:
                  owner.user.id,
              }),
            );
          },
        );

        it(
          "persists the EDITOR collaborator",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const token =
              await createShareToken(
                "EDITOR",
              );

            await assignCollaborator(
              document.id,
              session,
              token,
            );

            const record =
              await prisma.documentCollaborator.findUnique(
                {
                  where: {
                    documentId_userId:
                      {
                        documentId:
                          document.id,

                        userId:
                          collaborator.user
                            .id,
                      },
                  },
                },
              );

            expect(record).toEqual(
              expect.objectContaining({
                documentId:
                  document.id,

                userId:
                  collaborator.user.id,

                role: "EDITOR",

                invitedBy:
                  owner.user.id,
              }),
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * VIEWER
     * =======================================================
     */

    describe(
      "viewer permissions",
      () => {
        it(
          "assigns an authenticated user as VIEWER",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const token =
              await createShareToken(
                "VIEWER",
              );

            const result =
              await assignCollaborator(
                document.id,
                session,
                token,
              );

            expect(result).toEqual(
              expect.objectContaining({
                documentId:
                  document.id,

                userId:
                  collaborator.user.id,

                role: "VIEWER",

                invitedBy:
                  owner.user.id,
              }),
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * UPSERT
     * =======================================================
     */

    describe(
      "collaborator upsert",
      () => {
        it(
          "updates an existing collaborator instead of creating a duplicate",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const editorToken =
              await createShareToken(
                "EDITOR",
              );

            const first =
              await assignCollaborator(
                document.id,
                session,
                editorToken,
              );

            const viewerToken =
              await createShareToken(
                "VIEWER",
              );

            const second =
              await assignCollaborator(
                document.id,
                session,
                viewerToken,
              );

            expect(first?.id).toBe(
              second?.id,
            );

            const records =
              await prisma.documentCollaborator.findMany(
                {
                  where: {
                    documentId:
                      document.id,

                    userId:
                      collaborator.user.id,
                  },
                },
              );

            expect(records).toHaveLength(
              1,
            );

            expect(
              records[0].role,
            ).toBe("VIEWER");
          },
        );
      },
    );

    /**
     * =======================================================
     * TOKEN AUTHORIZATION
     * =======================================================
     */

    describe(
      "share token authorization",
      () => {
        it(
          "does not assign a collaborator with an invalid token",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const result =
              await assignCollaborator(
                document.id,
                session,
                "invalid-token",
              );

            expect(result).toBeUndefined();

            const record =
              await prisma.documentCollaborator.findUnique(
                {
                  where: {
                    documentId_userId:
                      {
                        documentId:
                          document.id,

                        userId:
                          collaborator.user
                            .id,
                      },
                  },
                },
              );

            expect(record).toBeNull();
          },
        );

        it(
          "does not assign a collaborator using an OWNER token",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const ownerToken =
              await createShareToken(
                "OWNER",
              );

            const result =
              await assignCollaborator(
                document.id,
                session,
                ownerToken,
              );

            expect(result).toBeUndefined();

            const record =
              await prisma.documentCollaborator.findUnique(
                {
                  where: {
                    documentId_userId:
                      {
                        documentId:
                          document.id,

                        userId:
                          collaborator.user
                            .id,
                      },
                  },
                },
              );

            expect(record).toBeNull();
          },
        );
      },
    );

    /**
     * =======================================================
     * DOCUMENT VALIDATION
     * =======================================================
     */

    describe(
      "document validation",
      () => {
        it(
          "rejects a nonexistent document",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const token =
              await createShareToken(
                "EDITOR",
              );

            await expect(
              assignCollaborator(
                "non-existent-document-id",
                session,
                token,
              ),
            ).rejects.toThrow(
              "Failed to assign collaborator",
            );
          },
        );

        it(
          "rejects an empty document id",
          async () => {
            const session =
              await authenticate(
                collaborator.user.id,
              );

            const token =
              await createShareToken(
                "EDITOR",
              );

            await expect(
              assignCollaborator(
                "",
                session,
                token,
              ),
            ).rejects.toThrow(
              "Failed to assign collaborator",
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * USER VALIDATION
     * =======================================================
     */

    describe(
      "collaborator validation",
      () => {
        it(
          "rejects a session for a nonexistent user",
          async () => {
            const token =
              await createShareToken(
                "EDITOR",
              );

            const invalidSession = {
              isAuth: true,
              userId:
                "non-existent-user-id",
            };

            await expect(
              assignCollaborator(
                document.id,
                invalidSession,
                token,
              ),
            ).rejects.toThrow(
              "Failed to assign collaborator",
            );
          },
        );
      },
    );
  },
);