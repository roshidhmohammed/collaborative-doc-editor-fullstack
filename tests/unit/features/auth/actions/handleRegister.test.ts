import { redirect } from "next/navigation";

import { handleRegister } from "@/features/auth/actions/handleRegister";
import { createUser } from "@/features/auth/services/createUser";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/features/auth/services/createUser", () => ({
  createUser: jest.fn(),
}));

describe("handleRegister", () => {
  const mockRedirect = redirect as jest.MockedFunction<
    typeof redirect
  >;

  const mockCreateUser =
    createUser as jest.MockedFunction<typeof createUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createFormData = ({
    fullName,
    email,
    password,
    confirmPassword,
  }: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {}) => {
    const formData = new FormData();

    if (fullName !== undefined) {
      formData.set("fullName", fullName);
    }

    if (email !== undefined) {
      formData.set("email", email);
    }

    if (password !== undefined) {
      formData.set("password", password);
    }

    if (confirmPassword !== undefined) {
      formData.set("confirmPassword", confirmPassword);
    }

    return formData;
  };

  const validFormData = () =>
    createFormData({
      fullName: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });

  describe("Validation", () => {
    it("returns validation errors when all fields are missing", async () => {
      const formData = createFormData();

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toBeDefined();

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Register a user. Please check and try again.",
      );

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when full name is missing", async () => {
      const formData = createFormData({
        email: "john@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Register a user. Please check and try again.",
      );

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when email is missing", async () => {
      const formData = createFormData({
        fullName: "John Doe",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Register a user. Please check and try again.",
      );

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when password is missing", async () => {
      const formData = createFormData({
        fullName: "John Doe",
        email: "john@example.com",
        confirmPassword: "Password123!",
      });

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toHaveProperty("errors");

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when confirmPassword is missing", async () => {
      const formData = createFormData({
        fullName: "John Doe",
        email: "john@example.com",
        password: "Password123!",
      });

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toHaveProperty("errors");

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors for an invalid email", async () => {
      const formData = createFormData({
        fullName: "John Doe",
        email: "invalid-email",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toHaveProperty("errors");

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when passwords do not match", async () => {
      const formData = createFormData({
        fullName: "John Doe",
        email: "john@example.com",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      });

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Register a user. Please check and try again.",
      );

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Successful registration", () => {
    it("calls createUser with validated registration data", async () => {
      mockCreateUser.mockResolvedValue({
        id: "user-123",
      } as any);

      const formData = validFormData();

      await handleRegister(undefined, formData);

      expect(mockCreateUser).toHaveBeenCalledTimes(1);

      expect(mockCreateUser).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "Password123!",
      );
    });

    it("returns a successful registration response", async () => {
      mockCreateUser.mockResolvedValue({
        id: "user-123",
      } as any);

      const formData = validFormData();

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: true,
        message: "Registration successful!",
      });
    });

    it("does not redirect when createUser succeeds", async () => {
      mockCreateUser.mockResolvedValue({
        id: "user-123",
      } as any);

      const formData = validFormData();

      await handleRegister(undefined, formData);

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("createUser errors", () => {
    it("returns the Error message when createUser throws an Error", async () => {
      mockCreateUser.mockRejectedValue(
        new Error("Email already exists"),
      );

      const formData = validFormData();

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Email already exists",
      });

      expect(mockCreateUser).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "Password123!",
      );

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("converts a non-Error rejection into a string", async () => {
      mockCreateUser.mockRejectedValue(
        "Registration service unavailable",
      );

      const formData = validFormData();

      const result = await handleRegister(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Registration service unavailable",
      });

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does not redirect when createUser throws", async () => {
      mockCreateUser.mockRejectedValue(
        new Error("Database error"),
      );

      const formData = validFormData();

      await handleRegister(undefined, formData);

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Falsy createUser response", () => {
    it("redirects to login when createUser returns null", async () => {
      mockCreateUser.mockResolvedValue(null as any);

      const formData = validFormData();

      await handleRegister(undefined, formData);

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });

    it("redirects to login when createUser returns undefined", async () => {
      mockCreateUser.mockResolvedValue(undefined as any);

      const formData = validFormData();

      await handleRegister(undefined, formData);

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
      );
    });
  });

  describe("Previous state", () => {
    it("accepts a previous registration state", async () => {
      mockCreateUser.mockResolvedValue({
        id: "user-123",
      } as any);

      const previousState = {
        success: false,
        message: "Previous registration failed",
        errors: "",
      };

      const formData = validFormData();

      const result = await handleRegister(
        previousState,
        formData,
      );

      expect(result).toEqual({
        success: true,
        message: "Registration successful!",
      });

      expect(mockCreateUser).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "Password123!",
      );
    });
  });

  describe("Service interaction", () => {
    it("does not call createUser when validation fails", async () => {
      const formData = createFormData({
        fullName: "",
        email: "invalid",
        password: "",
        confirmPassword: "",
      });

      await handleRegister(undefined, formData);

      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it("passes only validated fields to createUser", async () => {
      mockCreateUser.mockResolvedValue({
        id: "user-123",
      } as any);

      const formData = validFormData();

      await handleRegister(undefined, formData);

      expect(mockCreateUser).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "Password123!",
      );

      expect(mockCreateUser).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
