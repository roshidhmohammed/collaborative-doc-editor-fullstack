import { jest } from "@jest/globals";

import prisma from "@/lib/db/prisma";

import {
  validRegistrationCredentials,
  passwordMismatchCredentials,
} from "../../../fixtures/auth/registration";

import {
  cleanDatabase,
  createFormData,
  disconnectDatabase,
} from "../../../utils";
import { createUser } from "../../../factories";

const mockRedirect = jest.fn();

jest.unstable_mockModule("next/navigation", () => ({
  redirect: mockRedirect,
}));

const { handleRegister } =
  await import("@/features/auth/actions/handleRegister");

describe("Authentication Registration Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe("successful registration", () => {
    it("creates a new user with valid registration data", async () => {
      const email = `integration-${crypto.randomUUID()}@example.com`;

      const formData = createFormData({
        ...validRegistrationCredentials,
        email,
      });

      const result = await handleRegister(undefined, formData);

      expect(result).toEqual({
        message: "Registration successful!",
        success: true
      });

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      expect(user).toEqual(
        expect.objectContaining({
          fullName: validRegistrationCredentials.fullName,
          email,
        }),
      );

      expect(user?.password).not.toBe(validRegistrationCredentials.password);
    });
  });

  it("stores a hashed password instead of the plaintext password", async () => {
    const email = `hash-${crypto.randomUUID()}@example.com`;

    const formData = createFormData({
      ...validRegistrationCredentials,
      email,
    });

    await handleRegister(undefined, formData);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    expect(user).toBeDefined();

    expect(user?.password).not.toBe(validRegistrationCredentials.password);

    expect(user?.password).toHaveLength(60);
  });

  it("persists the expected user fields", async () => {
    const email = `persist-${crypto.randomUUID()}@example.com`;

    const formData = createFormData({
      ...validRegistrationCredentials,
      email,
    });

    await handleRegister(undefined, formData);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    expect(user).toEqual(
      expect.objectContaining({
        fullName: validRegistrationCredentials.fullName,
        email,
      }),
    );
  });

  describe("duplicate registration", () => {
    it("rejects registration when the email already exists", async () => {
      const email = `duplicate-${crypto.randomUUID()}@example.com`;

      await createUser({
        email,
        fullName: "Existing User",
      });

      

      const formData = createFormData({
        ...validRegistrationCredentials,
        email,
      });

      const result = await handleRegister(undefined, formData);

      expect(result).toEqual({
        success: false,
        message: "A user with this email already exists.",
      });

      const users = await prisma.user.findMany({
        where: {
          email,
        },
      });

      expect(users).toHaveLength(1);

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("does not access the database when validation fails", async () => {
      const findUniqueSpy = jest.spyOn(prisma.user, "findUnique");

      const formData = createFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      const result = await handleRegister(undefined, formData);

      expect(result).toHaveProperty("errors");

      expect(findUniqueSpy).not.toHaveBeenCalled();

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("rejects passwords that do not match", async () => {
      const findUniqueSpy = jest.spyOn(prisma.user, "findUnique");

      const formData = createFormData(passwordMismatchCredentials);

      const result = await handleRegister(undefined, formData);

      expect(result).toMatchObject({
        errors: {
          confirmPassword: ["Passwords do not match."],
        },
      });

      expect(findUniqueSpy).not.toHaveBeenCalled();

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("required fields", () => {
    it.each([
      {
        name: "missing full name",
        values: {
          fullName: "",
          email: "user@example.com",
          password: "Password@123",
          confirmPassword: "Password@123",
        },
      },
      {
        name: "missing email",
        values: {
          fullName: "Test User",
          email: "",
          password: "Password@123",
          confirmPassword: "Password@123",
        },
      },
      {
        name: "missing password",
        values: {
          fullName: "Test User",
          email: "user@example.com",
          password: "",
          confirmPassword: "",
        },
      },
      {
        name: "missing confirmation password",
        values: {
          fullName: "Test User",
          email: "user@example.com",
          password: "Password@123",
          confirmPassword: "",
        },
      },
    ])("rejects registration when $name", async ({ values }) => {
      const findUniqueSpy = jest.spyOn(prisma.user, "findUnique");

      const formData = createFormData(values);

      const result = await handleRegister(undefined, formData);

      expect(result).toHaveProperty("errors");

      expect(findUniqueSpy).not.toHaveBeenCalled();

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
