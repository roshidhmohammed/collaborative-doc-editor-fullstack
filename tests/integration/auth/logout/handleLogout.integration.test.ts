import { jest } from "@jest/globals";

import { createCookieStore } from "../../../mocks/next/headers.mock";

const mockCookies = jest.fn();
const mockRedirect = jest.fn();

jest.unstable_mockModule("next/headers", () => ({
  cookies: mockCookies,
}));

jest.unstable_mockModule("next/navigation", () => ({
  redirect: mockRedirect,

  // Required because logout.ts imports RedirectType.
  RedirectType: {
    push: "push",
    replace: "replace",
  },
}));

const { handleLogout } = await import(
  "@/features/user/actions/logout"
);

describe("Authentication Logout Integration", () => {
  let cookieStore: ReturnType<
    typeof createCookieStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    cookieStore = createCookieStore();

    mockCookies.mockResolvedValue(cookieStore);
  });

  describe("successful logout", () => {
    it("deletes the session cookie and redirects to login", async () => {
      cookieStore.set(
        "session",
        "test-session-token",
      );

      await handleLogout();

      expect(
        cookieStore.delete,
      ).toHaveBeenCalledTimes(1);

      expect(
        cookieStore.delete,
      ).toHaveBeenCalledWith("session");

      expect(
        mockRedirect,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockRedirect,
      ).toHaveBeenCalledWith(
        "/login",
        "replace",
      );
    });

    it("removes the existing session from the cookie store", async () => {
      cookieStore.set(
        "session",
        "test-session-token",
      );

      expect(
        cookieStore.getValue("session"),
      ).toBe("test-session-token");

      await handleLogout();

      expect(
        cookieStore.getValue("session"),
      ).toBeUndefined();
    });
  });

  describe("logout without an existing session", () => {
    it("still deletes the session and redirects to login", async () => {
      expect(
        cookieStore.getValue("session"),
      ).toBeUndefined();

      await handleLogout();

      expect(
        cookieStore.delete,
      ).toHaveBeenCalledTimes(1);

      expect(
        cookieStore.delete,
      ).toHaveBeenCalledWith("session");

      expect(
        mockRedirect,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockRedirect,
      ).toHaveBeenCalledWith(
        "/login",
        "replace",
      );
    });
  });
});