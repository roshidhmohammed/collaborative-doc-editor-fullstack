import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

import { createUser } from "@/features/auth/services/createUser";

jest.mock("@/lib/db/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

describe("createUser", () => {
  const mockFindUnique = prisma.user
    .findUnique as jest.MockedFunction<
    typeof prisma.user.findUnique
  >;

  const mockCreate = prisma.user
    .create as jest.MockedFunction<
    typeof prisma.user.create
  >;

  const mockHash = bcrypt.hash as jest.MockedFunction<
    typeof bcrypt.hash
  >;

  const validUser = {
    fullName: "John Doe",
    email: "john@example.com",
    password: "Password123!",
  };

  const createdUser = {
    id: "user-123",
    fullName: "John Doe",
    email: "john@example.com",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    it("throws when fullName is missing", async () => {
      await expect(
        createUser(
          "",
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow(
        "Full name, email, and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("throws when email is missing", async () => {
      await expect(
        createUser(
          validUser.fullName,
          "",
          validUser.password,
        ),
      ).rejects.toThrow(
        "Full name, email, and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("throws when password is missing", async () => {
      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          "",
        ),
      ).rejects.toThrow(
        "Full name, email, and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("throws when all required fields are missing", async () => {
      await expect(
        createUser("", "", ""),
      ).rejects.toThrow(
        "Full name, email, and password are required",
      );

      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("does not query the database when validation fails", async () => {
      await expect(
        createUser("", validUser.email, validUser.password),
      ).rejects.toThrow();

      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("Existing user", () => {
    it("throws when a user with the email already exists", async () => {
      mockFindUnique.mockResolvedValue({
        id: "existing-user",
        email: validUser.email,
      } as any);

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow(
        "A user with this email already exists.",
      );

      expect(mockFindUnique).toHaveBeenCalledTimes(1);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          email: validUser.email,
        },
      });

      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("does not hash the password when the user already exists", async () => {
      mockFindUnique.mockResolvedValue({
        id: "existing-user",
        email: validUser.email,
      } as any);

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow();

      expect(mockHash).not.toHaveBeenCalled();
    });

    it("does not create a new user when the email already exists", async () => {
      mockFindUnique.mockResolvedValue({
        id: "existing-user",
        email: validUser.email,
      } as any);

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow();

      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("Password hashing", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed-password");
      mockCreate.mockResolvedValue(createdUser as any);
    });

    it("hashes the password before creating the user", async () => {
      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(mockHash).toHaveBeenCalledTimes(1);

      expect(mockHash).toHaveBeenCalledWith(
        validUser.password,
        12,
      );
    });

    it("does not store the plain-text password", async () => {
      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: "hashed-password",
          }),
        }),
      );

      expect(mockCreate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: validUser.password,
          }),
        }),
      );
    });
  });

  describe("Database creation", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed-password");
      mockCreate.mockResolvedValue(createdUser as any);
    });

    it("checks whether the email already exists", async () => {
      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(mockFindUnique).toHaveBeenCalledTimes(1);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: {
          email: validUser.email,
        },
      });
    });

    it("creates the user with the correct data", async () => {
      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(mockCreate).toHaveBeenCalledTimes(1);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          fullName: validUser.fullName,
          email: validUser.email,
          password: "hashed-password",
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it("uses the hashed password in the database operation", async () => {
      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      const createCall = mockCreate.mock.calls[0][0];

      expect(createCall.data.password).toBe(
        "hashed-password",
      );
    });

    it("does not expose the password in the select clause", async () => {
      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      );

      const createCall = mockCreate.mock.calls[0][0];

      expect(
        createCall.select,
      ).not.toHaveProperty("password");
    });
  });

  describe("Successful creation", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed-password");
      mockCreate.mockResolvedValue(createdUser as any);
    });

    it("returns the newly created user", async () => {
      const result = await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(result).toEqual(createdUser);
    });

    it("returns the created user's id", async () => {
      const result = await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(result.id).toBe("user-123");
    });

    it("returns the created user's profile information", async () => {
      const result = await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(result.fullName).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
    });

    it("does not return the password", async () => {
      const result = await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(result).not.toHaveProperty("password");
    });

    it("returns createdAt and updatedAt", async () => {
      const result = await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("updatedAt");
    });
  });

  describe("Error handling", () => {
    it("propagates a Prisma findUnique error", async () => {
      const error = new Error(
        "Database connection failed",
      );

      mockFindUnique.mockRejectedValue(error);

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow("Database connection failed");

      expect(mockHash).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("propagates a bcrypt hashing error", async () => {
      mockFindUnique.mockResolvedValue(null);

      mockHash.mockRejectedValue(
        new Error("Password hashing failed"),
      );

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow("Password hashing failed");

      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("propagates a Prisma create error", async () => {
      mockFindUnique.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed-password");

      mockCreate.mockRejectedValue(
        new Error("Failed to create user"),
      );

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toThrow("Failed to create user");
    });

    it("does not swallow service errors", async () => {
      const error = new Error("Unexpected database error");

      mockFindUnique.mockRejectedValue(error);

      await expect(
        createUser(
          validUser.fullName,
          validUser.email,
          validUser.password,
        ),
      ).rejects.toBe(error);
    });
  });

  describe("Execution order", () => {
    it("checks for an existing user before hashing the password", async () => {
      const calls: string[] = [];

      mockFindUnique.mockImplementation(async () => {
        calls.push("findUnique");
        return null;
      });

      mockHash.mockImplementation(async () => {
        calls.push("hash");
        return "hashed-password";
      });

      mockCreate.mockImplementation(async () => {
        calls.push("create");
        return createdUser as any;
      });

      await createUser(
        validUser.fullName,
        validUser.email,
        validUser.password,
      );

      expect(calls).toEqual([
        "findUnique",
        "hash",
        "create",
      ]);
    });
  });
});
