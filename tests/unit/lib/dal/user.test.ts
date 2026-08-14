import { getUser } from "@/lib/dal/user";
import prisma from "@/lib/db/prisma";

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    cache: (fn: unknown) => fn,
  };
});

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/dal/auth", () => ({
  verifySession: jest.fn(),
}));

describe("getUser", () => {
  const mockFindUnique =
    prisma.user.findUnique as jest.MockedFunction<
      typeof prisma.user.findUnique
    >;

  const mockUser = {
    id: "user-123",
    fullName: "Jane Doe",
    email: "jane@example.com",
    password: "hashed-password",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    it("returns null when the session is not authenticated", async () => {
      const result = await getUser({
        isAuth: false,
        userId: "user-123",
      });

      expect(result).toBeNull();

      expect(
        mockFindUnique,
      ).not.toHaveBeenCalled();
    });

    it("does not query Prisma for an unauthenticated session", async () => {
      await getUser({
        isAuth: false,
        userId: "user-123",
      });

      expect(
        mockFindUnique,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated user", () => {
    it("fetches the user using the session userId", async () => {
      mockFindUnique.mockResolvedValue(
        mockUser as any,
      );

      await getUser({
        isAuth: true,
        userId: "user-123",
      });

      expect(
        mockFindUnique,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
      });
    });

    it("returns the user returned by Prisma", async () => {
      mockFindUnique.mockResolvedValue(
        mockUser as any,
      );

      const result = await getUser({
        isAuth: true,
        userId: "user-123",
      });

      expect(result).toEqual(mockUser);
    });

    it("returns null when the user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await getUser({
        isAuth: true,
        userId: "user-123",
      });

      expect(result).toBeNull();
    });

    it("converts the userId to a string", async () => {
      mockFindUnique.mockResolvedValue(
        mockUser as any,
      );

      await getUser({
        isAuth: true,
        userId: 12345,
      } as any);

      expect(
        mockFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: "12345",
        },
      });
    });
  });

  describe("Database errors", () => {
    it("returns null when Prisma throws an error", async () => {
      mockFindUnique.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const result = await getUser({
        isAuth: true,
        userId: "user-123",
      });

      expect(result).toBeNull();
    });

    it("does not throw when Prisma fails", async () => {
      mockFindUnique.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        getUser({
          isAuth: true,
          userId: "user-123",
        }),
      ).resolves.toBeNull();
    });
  });

  describe("Different users", () => {
    it("fetches the correct user for another session", async () => {
      const anotherUser = {
        ...mockUser,
        id: "user-456",
        email: "john@example.com",
      };

      mockFindUnique.mockResolvedValue(
        anotherUser as any,
      );

      const result = await getUser({
        isAuth: true,
        userId: "user-456",
      });

      expect(
        mockFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: "user-456",
        },
      });

      expect(result).toEqual(
        anotherUser,
      );
    });
  });
});