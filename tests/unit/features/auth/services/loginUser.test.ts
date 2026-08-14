import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

import { loginUser } from "@/features/auth/services/loginUser";

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

describe("loginUser", () => {
  const mockFindUnique = prisma.user
    .findUnique as jest.MockedFunction<
    typeof prisma.user.findUnique
  >;

  const mockCompare = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  const validCredentials = {
    email: "john@example.com",
    password: "Password123!",
  };

  const mockUser = {
    id: "user-123",
    fullName: "John Doe",
    email: "john@example.com",
    password: "$2b$12$hashed-password",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const expectedSafeUser = {
    id: "user-123",
    fullName: "John Doe",
    email: "john@example.com",
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    it("throws when email is missing", async () => {
      await expect(
        loginUser("", validCredentials.password),
      ).rejects.toThrow(
        "Email and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("throws when password is missing", async () => {
      await expect(
        loginUser(validCredentials.email, ""),
      ).rejects.toThrow(
        "Email and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("throws when both email and password are missing", async () => {
      await expect(
        loginUser("", ""),
      ).rejects.toThrow(
        "Email and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("does not access the database when validation fails", async () => {
      await expect(
        loginUser("", validCredentials.password),
      ).rejects.toThrow();

      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("User lookup", () => {
    it("searches for the user using the provided email", async () => {
      mockFindUnique.mockResolvedValue(mockUser as any);
      mockCompare.mockResolvedValue(true);

      await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(mockFindUnique).toHaveBeenCalledTimes(1);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          email: validCredentials.email,
        },
      });
    });

    it("throws when the user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow(
        "Full name, email, and password are required",
      );

      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("does not compare the password when the user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow();

      expect(mockCompare).not.toHaveBeenCalled();
    });
  });

  describe("Password verification", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(mockUser as any);
    });

    it("compares the provided password with the stored password", async () => {
      mockCompare.mockResolvedValue(true);

      await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(mockCompare).toHaveBeenCalledTimes(1);

      expect(mockCompare).toHaveBeenCalledWith(
        validCredentials.password,
        mockUser.password,
      );
    });

    it("throws when the password is incorrect", async () => {
      mockCompare.mockResolvedValue(false);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow("Password is incorrect");
    });

    it("does not return the user when the password is invalid", async () => {
      mockCompare.mockResolvedValue(false);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow();

      expect(mockFindUnique).toHaveBeenCalledTimes(1);
      expect(mockCompare).toHaveBeenCalledTimes(1);
    });
  });

  describe("Successful login", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(mockUser as any);
      mockCompare.mockResolvedValue(true);
    });

    it("returns the user when credentials are valid", async () => {
      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result).toEqual(expectedSafeUser);
    });

    it("returns the user id", async () => {
      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result.id).toBe("user-123");
    });

    it("returns the user's full name", async () => {
      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result.fullName).toBe("John Doe");
    });

    it("returns the user's email", async () => {
      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result.email).toBe("john@example.com");
    });

    it("does not expose the password", async () => {
      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result).not.toHaveProperty("password");
    });

    it("returns createdAt and updatedAt", async () => {
      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
    });
  });

  describe("Error handling", () => {
    it("propagates a database lookup error", async () => {
      const error = new Error(
        "Database connection failed",
      );

      mockFindUnique.mockRejectedValue(error);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow("Database connection failed");

      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("propagates a bcrypt comparison error", async () => {
      mockFindUnique.mockResolvedValue(mockUser as any);

      mockCompare.mockRejectedValue(
        new Error("Password comparison failed"),
      );

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow(
        "Password comparison failed",
      );
    });

    it("preserves the original database error", async () => {
      const error = new Error("Unexpected database error");

      mockFindUnique.mockRejectedValue(error);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toBe(error);
    });

    it("preserves the original bcrypt error", async () => {
      mockFindUnique.mockResolvedValue(mockUser as any);

      const error = new Error(
        "Unexpected bcrypt error",
      );

      mockCompare.mockRejectedValue(error);

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toBe(error);
    });
  });

  describe("Execution order", () => {
    it("looks up the user before comparing the password", async () => {
      const calls: string[] = [];

      mockFindUnique.mockImplementation(async () => {
        calls.push("findUnique");
        return mockUser as any;
      });

      mockCompare.mockImplementation(async () => {
        calls.push("compare");
        return true;
      });

      await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(calls).toEqual([
        "findUnique",
        "compare",
      ]);
    });

    it("does not compare the password before user lookup succeeds", async () => {
      mockFindUnique.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        loginUser(
          validCredentials.email,
          validCredentials.password,
        ),
      ).rejects.toThrow("Database error");

      expect(mockCompare).not.toHaveBeenCalled();
    });
  });

  describe("Security", () => {
    it("never returns the stored password", async () => {
      mockFindUnique.mockResolvedValue(mockUser as any);
      mockCompare.mockResolvedValue(true);

      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result).not.toHaveProperty("password");

      expect(result).toEqual(
        expect.not.objectContaining({
          password: mockUser.password,
        }),
      );
    });

    it("returns only the safe user properties", async () => {
      mockFindUnique.mockResolvedValue(mockUser as any);
      mockCompare.mockResolvedValue(true);

      const result = await loginUser(
        validCredentials.email,
        validCredentials.password,
      );

      expect(result).toEqual({
        id: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });
});
