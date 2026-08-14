import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal/auth";
import { decrypt } from "@/lib/auth/session";
import { getUser } from "@/lib/dal/user";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/auth/session", () => ({
  decrypt: jest.fn(),
}));

jest.mock("@/lib/dal/user", () => ({
  getUser: jest.fn(),
}));

describe("verifySession", () => {
  const mockCookies = cookies as jest.MockedFunction<
    typeof cookies
  >;

  const mockDecrypt = decrypt as jest.MockedFunction<
    typeof decrypt
  >;

  const mockGetUser = getUser as jest.MockedFunction<
    typeof getUser
  >;

  const mockRedirect = redirect as jest.MockedFunction<
    typeof redirect
  >;

  const mockCookieStore = {
    get: jest.fn(),
  };

  const validUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();

    mockCookies.mockResolvedValue(
      mockCookieStore as any,
    );

    mockCookieStore.get.mockReturnValue({
      value: "valid-session-token",
    });

    mockDecrypt.mockResolvedValue({
      userId: validUserId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    } as any);

    mockGetUser.mockReturnValue({
      id: validUserId,
    } as any);

    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  describe("Successful authentication", () => {
    it("returns authenticated session for a valid session", async () => {
      const result = await verifySession();

      expect(result).toEqual({
        isAuth: true,
        userId: validUserId,
      });
    });

    it("reads the session cookie", async () => {
      await verifySession();

      expect(mockCookies).toHaveBeenCalledTimes(1);

      expect(
        mockCookieStore.get,
      ).toHaveBeenCalledWith("session");
    });

    it("decrypts the session cookie", async () => {
      await verifySession();

      expect(mockDecrypt).toHaveBeenCalledTimes(1);

      expect(mockDecrypt).toHaveBeenCalledWith(
        "valid-session-token",
      );
    });

    it("validates the authenticated user", async () => {
      await verifySession();

      expect(mockGetUser).toHaveBeenCalledTimes(1);

      expect(mockGetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validUserId,
        }),
      );
    });

    it("returns the correct user id", async () => {
      mockDecrypt.mockResolvedValue({
        userId: "user-456",
        exp: Math.floor(Date.now() / 1000) + 3600,
      } as any);

      mockGetUser.mockReturnValue({
        id: "user-456",
      } as any);

      const result = await verifySession();

      expect(result.userId).toBe("user-456");
      expect(result.isAuth).toBe(true);
    });
  });

  describe("Missing session", () => {
    it("redirects when the session cookie does not exist", async () => {
      mockCookieStore.get.mockReturnValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });

    it("does not attempt to decrypt when there is no cookie", async () => {
      mockCookieStore.get.mockReturnValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow();

      expect(mockDecrypt).not.toHaveBeenCalled();
    });

    it("does not call getUser when there is no cookie", async () => {
      mockCookieStore.get.mockReturnValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow();

      expect(mockGetUser).not.toHaveBeenCalled();
    });
  });

  describe("Invalid session", () => {
    it("redirects when decrypt returns undefined", async () => {
      mockDecrypt.mockResolvedValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });

    it("does not call getUser when session decryption fails", async () => {
      mockDecrypt.mockResolvedValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow();

      expect(mockGetUser).not.toHaveBeenCalled();
    });
  });

  describe("Session payload validation", () => {
    it("redirects when userId is missing", async () => {
      mockDecrypt.mockResolvedValue({
        exp:
          Math.floor(Date.now() / 1000) +
          3600,
      } as any);

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });

    it("redirects when userId is empty", async () => {
      mockDecrypt.mockResolvedValue({
        userId: "",
        exp:
          Math.floor(Date.now() / 1000) +
          3600,
      } as any);

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );
    });

    it("redirects when exp is missing", async () => {
      mockDecrypt.mockResolvedValue({
        userId: validUserId,
      } as any);

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );
    });

    it("redirects when getUser returns null", async () => {
      mockGetUser.mockReturnValue(
        null as any,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );

      expect(mockGetUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validUserId,
        }),
      );
    });

    it("redirects when getUser returns undefined", async () => {
      mockGetUser.mockReturnValue(
        undefined as any,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );
    });
  });

  describe("Session expiration", () => {
    it("redirects when the session is expired", async () => {
      mockDecrypt.mockResolvedValue({
        userId: validUserId,
        exp:
          Math.floor(Date.now() / 1000) -
          3600,
      } as any);

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });

    it("redirects when the session expires exactly now", async () => {
      const currentTime = Math.floor(
        Date.now() / 1000,
      );

      mockDecrypt.mockResolvedValue({
        userId: validUserId,
        exp: currentTime,
      } as any);

      await expect(
        verifySession(),
      ).rejects.toThrow(
        "NEXT_REDIRECT:/login",
      );
    });

    it("does not redirect for a future expiration time", async () => {
      mockDecrypt.mockResolvedValue({
        userId: validUserId,
        exp:
          Math.floor(Date.now() / 1000) +
          3600,
      } as any);

      const result =
        await verifySession();

      expect(result).toEqual({
        isAuth: true,
        userId: validUserId,
      });

      expect(
        mockRedirect,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Redirect behavior", () => {
    it("redirects exactly once when authentication fails", async () => {
      mockCookieStore.get.mockReturnValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow();

      expect(mockRedirect).toHaveBeenCalledTimes(
        1,
      );
    });

    it("always redirects to /login", async () => {
      mockDecrypt.mockResolvedValue(
        undefined,
      );

      await expect(
        verifySession(),
      ).rejects.toThrow();

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });
  });
});