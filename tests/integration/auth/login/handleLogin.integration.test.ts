import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import { createCookieStore } from "../../../mocks/next/headers.mock";
import {
  invalidPasswordCredentials,
  unknownUserCredentials,
} from "../../../fixtures";
import { createUser } from "../../../factories";
import {
  cleanDatabase,
  createFormData,
  disconnectDatabase,
} from "../../../utils";

const mockCookies = jest.fn();
const mockRedirect = jest.fn();

jest.unstable_mockModule("next/headers", () => ({
  cookies: mockCookies,
}));

jest.unstable_mockModule("next/navigation", () => ({
  redirect: mockRedirect,
}));

const { handleLogin } = await import(
  "@/features/auth/actions/handleLogin"
);

const { decrypt } = await import(
  "@/lib/auth/session"
);

describe("Authentication Login Integration", () => {
  const cookieStore = createCookieStore();

  beforeEach(() => {
    jest.clearAllMocks();

    cookieStore.clear();

    mockCookies.mockResolvedValue(cookieStore);
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("successful authentication", () => {
    it("authenticates a valid user and redirects to documents", async () => {
      const { user, password } =
        await createUser();

      const formData = createFormData({
        email: user.email,
        password,
      });

      await handleLogin(undefined, formData);

      expect(
        cookieStore.set,
      ).toHaveBeenCalledTimes(1);

      expect(
        cookieStore.set,
      ).toHaveBeenCalledWith(
        "session",
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          expires: expect.any(Date),
        }),
      );

      expect(
        mockRedirect,
      ).toHaveBeenCalledWith("/documents");
    });

    it("creates a valid decryptable session", async () => {
      const { user, password } =
        await createUser();

      const formData = createFormData({
        email: user.email,
        password,
      });

      await handleLogin(undefined, formData);

      const sessionToken =
        cookieStore.getValue("session");

      expect(sessionToken).toEqual(
        expect.any(String),
      );

      const payload =
        await decrypt(sessionToken);

      expect(payload).toEqual(
        expect.objectContaining({
          userId: user.id,
          expiresAt: expect.any(String),
        }),
      );
    });
  });

  describe("failed authentication", () => {
    it("rejects an invalid password", async () => {
      const { user } = await createUser({
        email:
          invalidPasswordCredentials.email,
      });

      const formData = createFormData({
        email: user.email,
        password:
          invalidPasswordCredentials.password,
      });

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Password is incorrect",
      });

      expect(
        cookieStore.getValue("session"),
      ).toBeUndefined();

      expect(
        cookieStore.set,
      ).not.toHaveBeenCalled();

      expect(
        mockRedirect,
      ).not.toHaveBeenCalled();
    });

    it("rejects an unknown user", async () => {
      const formData = createFormData(
        unknownUserCredentials,
      );

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message:
          "Full name, email, and password are required",
      });

      expect(
        cookieStore.getValue("session"),
      ).toBeUndefined();

      expect(
        cookieStore.set,
      ).not.toHaveBeenCalled();

      expect(
        mockRedirect,
      ).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("does not query the database for invalid input", async () => {
      const findUniqueSpy = jest.spyOn(
        prisma.user,
        "findUnique",
      );

      const formData = createFormData({
        email: "",
        password: "",
      });

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toHaveProperty(
        "errors",
      );

      expect(
        findUniqueSpy,
      ).not.toHaveBeenCalled();

      expect(
        cookieStore.set,
      ).not.toHaveBeenCalled();

      expect(
        mockRedirect,
      ).not.toHaveBeenCalled();

      findUniqueSpy.mockRestore();
    });

    it.each([
      {
        name: "missing email",
        email: "",
        password: "Password@123",
      },
      {
        name: "missing password",
        email: "user@example.com",
        password: "",
      },
      {
        name: "missing email and password",
        email: "",
        password: "",
      },
    ])(
      "rejects login when $name",
      async ({ email, password }) => {
        const formData = createFormData({
          email,
          password,
        });

        const result = await handleLogin(
          undefined,
          formData,
        );

        expect(result).toHaveProperty(
          "errors",
        );

        expect(
          cookieStore.set,
        ).not.toHaveBeenCalled();

        expect(
          mockRedirect,
        ).not.toHaveBeenCalled();
      },
    );
  });
});