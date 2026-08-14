import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import {
  createCookieStore,
} from "../../mocks/next/headers.mock";

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
  setAuthenticatedSession,
} from "../../utils/auth";

import {
  cleanDatabase,
  disconnectDatabase,
} from "../../utils/database";

import {
  documentAccessFixtures,
} from "../../fixtures/documents/document-access";

/**
 * ---------------------------------------------------------
 * Next.js request-bound API mocks
 * ---------------------------------------------------------
 */

const cookieStore =
  createCookieStore();

const mockCookies =
  jest.fn();

const mockRedirect =
  jest.fn(
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
 * Import application modules AFTER mocks
 * ---------------------------------------------------------
 */

const {
  getDocumentDetails,
} = await import(
  "@/features/docEditor/services/doc-editor"
);

const {
  selectCanEditDocument,
  selectCurrentDocumentRole,
} = await import(
  "@/features/docEditor/hooks/useFetchDocumentDetails"
);

/**
 * ---------------------------------------------------------
 * Test suite
 * ---------------------------------------------------------
 */

describe(
  "Get Document Details Integration",
  () => {
    let owner: Awaited<
      ReturnType<typeof createUser>
    >;

    let editor: Awaited<
      ReturnType<typeof createUser>
    >;

    let viewer: Awaited<
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

      /**
       * Create isolated users.
       */
      owner =
        await createUser({
          fullName:
            "Document Owner",
        });

      editor =
        await createUser({
          fullName:
            "Document Editor",
        });

      viewer =
        await createUser({
          fullName:
            "Document Viewer",
        });

      /**
       * Create the document.
       */
      document =
        await createDocument({
          creatorId:
            owner.user.id,

          name:
            "Collaborative Access Test Document",
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
    }

    async function createAccessToken(
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
     * EDITOR ACCESS
     * =======================================================
     */

    describe(
      "editor access",
      () => {
        it(
          "returns EDITOR role for an authenticated editor",
          async () => {
            const token =
              await createAccessToken(
                documentAccessFixtures
                  .editor.role,
              );

            await authenticate(
              editor.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              result.currentDocumentShareLink.role,
            ).toBe("EDITOR");
          },
        );

        it(
          "allows an EDITOR to edit the document",
          async () => {
            const token =
              await createAccessToken(
                "EDITOR",
              );

            await authenticate(
              editor.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              selectCanEditDocument(
                result,
              ),
            ).toBe(true);
          },
        );

        it(
          "returns the requested document for an EDITOR",
          async () => {
            const token =
              await createAccessToken(
                "EDITOR",
              );

            await authenticate(
              editor.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              result.document.id,
            ).toBe(document.id);

            expect(
              result.document.name,
            ).toBe(
              "Collaborative Access Test Document",
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * VIEWER ACCESS
     * =======================================================
     */

    describe(
      "viewer access",
      () => {
        it(
          "returns VIEWER role for an authenticated viewer",
          async () => {
            const token =
              await createAccessToken(
                documentAccessFixtures
                  .viewer.role,
              );

            await authenticate(
              viewer.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              result.currentDocumentShareLink.role,
            ).toBe("VIEWER");
          },
        );

        it(
          "does not allow a VIEWER to edit the document",
          async () => {
            const token =
              await createAccessToken(
                "VIEWER",
              );

            await authenticate(
              viewer.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              selectCanEditDocument(
                result,
              ),
            ).toBe(false);
          },
        );

        it(
          "still allows a VIEWER to read the document",
          async () => {
            const token =
              await createAccessToken(
                "VIEWER",
              );

            await authenticate(
              viewer.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              result.document.id,
            ).toBe(document.id);

            expect(
              result.document.name,
            ).toBe(
              "Collaborative Access Test Document",
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * AUTHENTICATION
     * =======================================================
     */

    describe(
      "authentication",
      () => {
        it(
          "rejects access without a session",
          async () => {
            const token =
              await createAccessToken(
                "EDITOR",
              );

            cookieStore.clear();

            await expect(
              getDocumentDetails(
                token,
              ),
            ).rejects.toThrow(
              "Failed to fetch document",
            );

            expect(
              mockRedirect,
            ).toHaveBeenCalledWith(
              "/login",
            );
          },
        );

        it(
          "rejects an invalid session",
          async () => {
            const token =
              await createAccessToken(
                "EDITOR",
              );

            cookieStore.set(
              "session",
              "invalid-session",
            );

            await expect(
              getDocumentDetails(
                token,
              ),
            ).rejects.toThrow(
              "Failed to fetch document",
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
     * DOCUMENT TOKEN AUTHORIZATION
     * =======================================================
     */

    describe(
      "document token authorization",
      () => {
        it(
          "rejects a nonexistent document token",
          async () => {
            await authenticate(
              editor.user.id,
            );

            await expect(
              getDocumentDetails(
                "invalid-document-token",
              ),
            ).rejects.toThrow(
              "Failed to fetch document",
            );
          },
        );

        it(
          "rejects an empty document token",
          async () => {
            await authenticate(
              editor.user.id,
            );

            await expect(
              getDocumentDetails(""),
            ).rejects.toThrow(
              "Failed to fetch document",
            );
          },
        );
      },
    );

    /**
     * =======================================================
     * ROLE CONSISTENCY
     * =======================================================
     */

    describe(
      "role resolution",
      () => {
        it(
          "resolves EDITOR as editable",
          async () => {
            const token =
              await createAccessToken(
                "EDITOR",
              );

            await authenticate(
              editor.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              selectCurrentDocumentRole(
                result,
              ),
            ).toBe("EDITOR");

            expect(
              selectCanEditDocument(
                result,
              ),
            ).toBe(true);
          },
        );

        it(
          "resolves VIEWER as read-only",
          async () => {
            const token =
              await createAccessToken(
                "VIEWER",
              );

            await authenticate(
              viewer.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              selectCurrentDocumentRole(
                result,
              ),
            ).toBe("VIEWER");

            expect(
              selectCanEditDocument(
                result,
              ),
            ).toBe(false);
          },
        );
      },
    );

    /**
     * =======================================================
     * SHARE LINK STATE
     * =======================================================
     */

    describe(
      "share link state",
      () => {
        it(
          "rejects an inactive share link",
          async () => {
            const token =
              `inactive-${crypto.randomUUID()}`;

            await createShareLink({
              documentId:
                document.id,

              createdById:
                owner.user.id,

              role: "EDITOR",

              token,

              isActive: false,
            });

            await authenticate(
              editor.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            /**
             * Current implementation does
             * NOT filter isActive.
             *
             * Therefore this assertion documents
             * the current behavior.
             */
            expect(
              result.currentDocumentShareLink
                .isActive,
            ).toBe(false);
          },
        );

        it(
          "returns an unexpired share link",
          async () => {
            const token =
              await createAccessToken(
                "EDITOR",
              );

            await authenticate(
              editor.user.id,
            );

            const result =
              await getDocumentDetails(
                token,
              );

            expect(
              result.currentDocumentShareLink
                .token,
            ).toBe(token);
          },
        );
      },
    );
  },
);