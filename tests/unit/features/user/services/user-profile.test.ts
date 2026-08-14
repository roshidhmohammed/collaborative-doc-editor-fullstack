import { cookies } from "next/headers";

import { decrypt } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

import { fetchUserProfile } from "@/features/user/services/user-profile";

jest.mock("@/lib/auth/session", () => ({
  decrypt: jest.fn(),
}));

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("fetchUserProfile", () => {
  const mockDecrypt =
    decrypt as jest.MockedFunction<typeof decrypt>;

  const mockCookies =
    cookies as jest.MockedFunction<typeof cookies>;

  const mockFindUnique =
    prisma.user.findUnique as jest.MockedFunction<
      typeof prisma.user.findUnique
    >;

  const mockCookieStore = {
    get: jest.fn(),
  };

  const userProfile = {
    id: "user-123",
    fullName: "Test User",
    email: "user@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCookies.mockResolvedValue(
      mockCookieStore as any,
    );
  });

  describe("Successful profile retrieval", () => {
    it("returns the authenticated user's profile", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(
        userProfile as any,
      );

      const result = await fetchUserProfile();

      expect(result).toEqual(userProfile);
    });

    it("reads the session cookie", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(
        userProfile as any,
      );

      await fetchUserProfile();

      expect(
        mockCookieStore.get,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCookieStore.get,
      ).toHaveBeenCalledWith("session");
    });

    it("decrypts the session cookie value", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(
        userProfile as any,
      );

      await fetchUserProfile();

      expect(mockDecrypt).toHaveBeenCalledTimes(1);

      expect(mockDecrypt).toHaveBeenCalledWith(
        "encrypted-session-token",
      );
    });

    it("queries Prisma using the session user ID", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(
        userProfile as any,
      );

      await fetchUserProfile();

      expect(mockFindUnique).toHaveBeenCalledTimes(1);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });
    });

    it("returns only the selected profile fields", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(
        userProfile as any,
      );

      const result = await fetchUserProfile();

      expect(result).toEqual({
        id: "user-123",
        fullName: "Test User",
        email: "user@example.com",
      });
    });
  });

  describe("User not found", () => {
    it("throws when the user does not exist", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(null);

      await expect(
        fetchUserProfile(),
      ).rejects.toThrow("User not found");
    });

    it("queries Prisma even when the user does not exist", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(null);

      await expect(
        fetchUserProfile(),
      ).rejects.toThrow("User not found");

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      });
    });
  });

  describe("Missing session cookie", () => {
    it("calls decrypt with undefined when the session cookie is missing", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      mockFindUnique.mockResolvedValue(
        userProfile as any,
      );

      await fetchUserProfile();

      expect(mockDecrypt).toHaveBeenCalledWith(
        undefined,
      );
    });

    it("handles a missing session when decrypt fails", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      mockDecrypt.mockRejectedValue(
        new Error("Invalid session"),
      );

      await expect(
        fetchUserProfile(),
      ).rejects.toThrow("Invalid session");

      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("Session errors", () => {
    it("propagates decrypt errors", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "invalid-session",
      });

      const error = new Error(
        "Failed to decrypt session",
      );

      mockDecrypt.mockRejectedValue(error);

      await expect(
        fetchUserProfile(),
      ).rejects.toThrow(
        "Failed to decrypt session",
      );
    });

    it("does not query Prisma when session decryption fails", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "invalid-session",
      });

      mockDecrypt.mockRejectedValue(
        new Error("Invalid session"),
      );

      await expect(
        fetchUserProfile(),
      ).rejects.toThrow("Invalid session");

      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("Database errors", () => {
    it("propagates Prisma errors", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      const error = new Error(
        "Database connection failed",
      );

      mockFindUnique.mockRejectedValue(error);

      await expect(
        fetchUserProfile(),
      ).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("does not swallow Prisma errors", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockResolvedValue({
        userId: "user-123",
      } as any);

      const error = new Error("Prisma query failed");

      mockFindUnique.mockRejectedValue(error);

      await expect(
        fetchUserProfile(),
      ).rejects.toBe(error);
    });
  });

  describe("Execution order", () => {
    it("decrypts the session before querying Prisma", async () => {
      const executionOrder: string[] = [];

      mockCookieStore.get.mockReturnValue({
        value: "encrypted-session-token",
      });

      mockDecrypt.mockImplementation(async () => {
        executionOrder.push("decrypt");
        return {
          userId: "user-123",
        } as any;
      });

      mockFindUnique.mockImplementation(async () => {
        executionOrder.push("findUnique");

        return userProfile as any;
      });

      await fetchUserProfile();

      expect(executionOrder).toEqual([
        "decrypt",
        "findUnique",
      ]);
    });
  });
});