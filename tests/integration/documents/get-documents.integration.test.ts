import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import {
  createCookieStore,
} from "../../mocks/next/headers.mock";

import {
  documentFixtures,
  collaboratorRoles,
} from "../../fixtures/documents/get-all-documents";

import { createUser } from "../../factories/user.factory";

import {
  createDocument,
} from "../../factories/document.factory";

import {
  createCollaborator,
} from "../../factories/collaborator.factory";

import {
  createShareLink,
} from "../../factories/share-link.factory";

import {
  cleanTestDocuments,
  cleanTestUsers,
  disconnectDatabase,
} from "../../utils/database";

/**
 * ---------------------------------------------------------
 * Next.js request-bound API mocks
 * ---------------------------------------------------------
 */

const cookieStore =
  createCookieStore();

const mockCookies = jest.fn();

const mockRedirect = jest.fn(
  (path: string): never => {
    throw new Error(
      `REDIRECT:${path}`,
    );
  },
);

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
 * ---------------------------------------------------------
 * Import real application modules AFTER mocks
 * ---------------------------------------------------------
 */

const { getAllDocuments } =
  await import(
    "@/features/docs/services/get-all-documents"
  );

const { encrypt } =
  await import(
    "@/lib/auth/session"
  );

/**
 * ---------------------------------------------------------
 * Test suite
 * ---------------------------------------------------------
 */

describe(
  "Get All Documents Integration",
  () => {
    let ownerUserId: string;
    let collaboratorUserId: string;
    let unrelatedUserId: string;

    const createdDocumentIds: string[] =
      [];

    const createdUserIds: string[] =
      [];

    /**
     * -------------------------------------------------------
     * Setup
     * -------------------------------------------------------
     */

    beforeEach(async () => {
      jest.clearAllMocks();

      cookieStore.clear();

      mockCookies.mockResolvedValue(
        cookieStore,
      );

      createdDocumentIds.length = 0;
      createdUserIds.length = 0;

      /**
       * Create isolated users for this test.
       */
      const owner =
        await createUser();

      const collaborator =
        await createUser();

      const unrelated =
        await createUser();

      ownerUserId =
        owner.user.id;

      collaboratorUserId =
        collaborator.user.id;

      unrelatedUserId =
        unrelated.user.id;

      createdUserIds.push(
        ownerUserId,
        collaboratorUserId,
        unrelatedUserId,
      );

      /**
       * Sanity check:
       * Make sure the users really exist.
       */
      const users =
        await prisma.user.findMany({
          where: {
            id: {
              in: createdUserIds,
            },
          },
        });

      expect(users).toHaveLength(3);
    });

    /**
     * -------------------------------------------------------
     * Cleanup
     * -------------------------------------------------------
     */

    afterEach(async () => {
      /**
       * Remove only records created by
       * this test.
       */
      await cleanTestDocuments(
        createdDocumentIds,
      );

      await cleanTestUsers(
        createdUserIds,
      );

      cookieStore.clear();
    });

    afterAll(async () => {
      await disconnectDatabase();
    });

    /**
     * -------------------------------------------------------
     * Authentication helper
     * -------------------------------------------------------
     */

    async function authenticateAs(
      userId: string,
    ) {
      /**
       * Create a REAL JWT using the application's
       * real encrypt() implementation.
       */
      const session =
        await encrypt({
          userId,
          expiresAt: new Date(
            Date.now() +
              7 * 24 * 60 * 60 * 1000,
          ),
        });

      /**
       * Put the REAL session token into
       * our mocked cookie store.
       */
      cookieStore.set(
        "session",
        session,
        {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        },
      );

      expect(
        cookieStore.getValue(
          "session",
        ),
      ).toBe(session);
    }

    /**
     * =======================================================
     * OWNER AUTHORIZATION
     * =======================================================
     */

    describe(
      "authenticated owner",
      () => {
        it(
          "returns documents owned by the authenticated user",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  documentFixtures
                    .ownerDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(result[0]).toEqual(
              expect.objectContaining({
                id: document.id,
                name:
                  documentFixtures
                    .ownerDocument
                    .title,
                creatorId:
                  ownerUserId,
              }),
            );
          },
        );

        it(
          "returns the owner's associated share token",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  documentFixtures
                    .ownerDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            const ownerToken =
              `owner-${crypto.randomUUID()}`;

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "OWNER",

              token: ownerToken,
            });

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(
              result[0]
                .associatedRoleToken,
            ).toBe(ownerToken);
          },
        );

        it(
          "does not return documents owned by another user",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  unrelatedUserId,

                name:
                  documentFixtures
                    .inaccessibleDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            const result =
              await getAllDocuments();

            expect(result).toEqual([]);
          },
        );
      },
    );

    /**
     * =======================================================
     * COLLABORATOR AUTHORIZATION
     * =======================================================
     */

    describe(
      "authenticated collaborator",
      () => {
        it(
          "returns documents shared with the authenticated collaborator",
          async () => {
            await authenticateAs(
              collaboratorUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  documentFixtures
                    .collaboratorDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            await createCollaborator({
              documentId:
                document.id,

              userId:
                collaboratorUserId,

              role:
                collaboratorRoles
                  .editor,
            });

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(result[0]).toEqual(
              expect.objectContaining({
                id: document.id,
                creatorId:
                  ownerUserId,
              }),
            );
          },
        );

        it(
          "returns the editor share token for an editor",
          async () => {
            await authenticateAs(
              collaboratorUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  "Editor Document",
              });

            createdDocumentIds.push(
              document.id,
            );

            await createCollaborator({
              documentId:
                document.id,

              userId:
                collaboratorUserId,

              role:
                collaboratorRoles
                  .editor,
            });

            const editorToken =
              `editor-${crypto.randomUUID()}`;

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "EDITOR",

              token: editorToken,
            });

            const result =
              await getAllDocuments();

            expect(
              result[0]
                .associatedRoleToken,
            ).toBe(editorToken);
          },
        );

        it(
          "returns the viewer share token for a viewer",
          async () => {
            await authenticateAs(
              collaboratorUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  "Viewer Document",
              });

            createdDocumentIds.push(
              document.id,
            );

            await createCollaborator({
              documentId:
                document.id,

              userId:
                collaboratorUserId,

              role:
                collaboratorRoles
                  .viewer,
            });

            const viewerToken =
              `viewer-${crypto.randomUUID()}`;

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "VIEWER",

              token: viewerToken,
            });

            const result =
              await getAllDocuments();

            expect(
              result[0]
                .associatedRoleToken,
            ).toBe(viewerToken);
          },
        );

        it(
          "does not return documents where the user is not a collaborator",
          async () => {
            await authenticateAs(
              collaboratorUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  documentFixtures
                    .inaccessibleDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            const result =
              await getAllDocuments();

            expect(result).toEqual([]);
          },
        );
      },
    );

    /**
     * =======================================================
     * AUTHORIZATION ISOLATION
     * =======================================================
     */

    describe(
      "authorization isolation",
      () => {
        it(
          "returns only documents accessible to the authenticated user",
          async () => {
            await authenticateAs(
              collaboratorUserId,
            );

            const privateDocument =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  "Private Document",
              });

            const sharedDocument =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  "Shared Document",
              });

            const unrelatedDocument =
              await createDocument({
                creatorId:
                  unrelatedUserId,

                name:
                  "Unrelated Document",
              });

            createdDocumentIds.push(
              privateDocument.id,
              sharedDocument.id,
              unrelatedDocument.id,
            );

            await createCollaborator({
              documentId:
                sharedDocument.id,

              userId:
                collaboratorUserId,

              role:
                collaboratorRoles
                  .viewer,
            });

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(
              result[0].id,
            ).toBe(
              sharedDocument.id,
            );

            const resultIds =
              result.map(
                (document) =>
                  document.id,
              );

            expect(
              resultIds,
            ).not.toContain(
              privateDocument.id,
            );

            expect(
              resultIds,
            ).not.toContain(
              unrelatedDocument.id,
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * SHARE LINK AUTHORIZATION
     * 
     * =======================================================
     */

    describe(
      "share link authorization",
      () => {
        it(
          "ignores inactive share links",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  documentFixtures
                    .inactiveShareDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "OWNER",

              token:
                "inactive-token",

              isActive: false,
            });

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(
              result[0]
                .associatedRoleToken,
            ).toBeNull();
          },
        );

        it(
          "ignores expired share links",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  documentFixtures
                    .expiredShareDocument
                    .title,
              });

            createdDocumentIds.push(
              document.id,
            );

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "OWNER",

              token:
                "expired-token",

              expiresAt:
                new Date(
                  Date.now() -
                    60_000,
                ),
            });

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(
              result[0]
                .associatedRoleToken,
            ).toBeNull();
          },
        );

        it(
          "uses an active non-expired share link",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const document =
              await createDocument({
                creatorId:
                  ownerUserId,

                name:
                  "Active Share Document",
              });

            createdDocumentIds.push(
              document.id,
            );

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "OWNER",

              token:
                "expired-token",

              expiresAt:
                new Date(
                  Date.now() -
                    60_000,
                ),
            });

            const activeToken =
              `active-${crypto.randomUUID()}`;

            await createShareLink({
              documentId:
                document.id,

              createdById:
                ownerUserId,

              role: "OWNER",

              token: activeToken,

              expiresAt:
                new Date(
                  Date.now() +
                    60_000,
                ),
            });

            const result =
              await getAllDocuments();

            expect(result).toHaveLength(
              1,
            );

            expect(
              result[0]
                .associatedRoleToken,
            ).toBe(activeToken);
          },
        );
      },
    );

    /**
     * =======================================================
     * EMPTY RESULT
     * =======================================================
     */

    describe(
      "empty result",
      () => {
        it(
          "returns an empty array when the authenticated user has no documents",
          async () => {
            await authenticateAs(
              ownerUserId,
            );

            const result =
              await getAllDocuments();

            expect(result).toEqual([]);
          },
        );
      },
    );

    /**
     * =======================================================
     * SESSION AUTHORIZATION
     * =======================================================
     */

    describe(
      "session authorization",
      () => {
        it(
          "redirects when no session cookie exists",
          async () => {
            cookieStore.clear();

            await expect(
              getAllDocuments(),
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
          "redirects when the session token is invalid",
          async () => {
            cookieStore.set(
              "session",
              "invalid-session-token",
            );

            await expect(
              getAllDocuments(),
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
  },
);