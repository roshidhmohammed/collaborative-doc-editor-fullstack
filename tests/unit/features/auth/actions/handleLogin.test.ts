import { redirect } from "next/navigation";

import { createSession } from "@/lib/auth/session";
import { handleLogin } from "@/features/auth/actions/handleLogin";
import { loginUser } from "@/features/auth/services/loginUser";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/auth/session", () => ({
  createSession: jest.fn(),
}));

jest.mock("@/features/auth/services/loginUser", () => ({
  loginUser: jest.fn(),
}));

describe("handleLogin", () => {
  const mockRedirect = redirect as jest.MockedFunction<
    typeof redirect
  >;

  const mockCreateSession =
    createSession as jest.MockedFunction<typeof createSession>;

  const mockLoginUser =
    loginUser as jest.MockedFunction<typeof loginUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Helper for creating FormData
   */
  const createFormData = (
    email?: string,
    password?: string,
  ) => {
    const formData = new FormData();

    if (email !== undefined) {
      formData.set("email", email);
    }

    if (password !== undefined) {
      formData.set("password", password);
    }

    return formData;
  };

  describe("Validation", () => {
    it("returns validation errors when email is missing", async () => {
      const formData = createFormData(
        undefined,
        "Password123!",
      );

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toBeDefined();

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Login. Please check and try again.",
      );

      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(mockCreateSession).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when password is missing", async () => {
      const formData = createFormData(
        "user@example.com",
        undefined,
      );

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toBeDefined();

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Login. Please check and try again.",
      );

      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(mockCreateSession).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("returns validation errors when both fields are missing", async () => {
      const formData = createFormData();

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toBeDefined();

      expect(result).toHaveProperty("errors");

      expect(result?.message).toBe(
        "Missing Fields. Failed to Login. Please check and try again.",
      );

      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(mockCreateSession).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does not call loginUser for invalid credentials format", async () => {
      const formData = createFormData(
        "invalid-email",
        "",
      );

      await handleLogin(undefined, formData);

      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(mockCreateSession).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Successful login", () => {
    it("calls loginUser with validated email and password", async () => {
      mockLoginUser.mockResolvedValue({
        id: "user-123",
      } as any);

      mockCreateSession.mockResolvedValue(undefined);

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(mockLoginUser).toHaveBeenCalledTimes(1);

      expect(mockLoginUser).toHaveBeenCalledWith(
        "user@example.com",
        "Password123!",
      );
    });

    it("creates a session using the authenticated user id", async () => {
      mockLoginUser.mockResolvedValue({
        id: "user-123",
      } as any);

      mockCreateSession.mockResolvedValue(undefined);

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(mockCreateSession).toHaveBeenCalledTimes(1);

      expect(mockCreateSession).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("redirects to documents after successful login", async () => {
      mockLoginUser.mockResolvedValue({
        id: "user-123",
      } as any);

      mockCreateSession.mockResolvedValue(undefined);

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/documents",
      );
    });

    it("performs login, session creation, and redirect in order", async () => {
      const calls: string[] = [];

      mockLoginUser.mockImplementation(async () => {
        calls.push("loginUser");

        return {
          id: "user-123",
        } as any;
      });

      mockCreateSession.mockImplementation(async () => {
        calls.push("createSession");
      });

      mockRedirect.mockImplementation((path) => {
        calls.push(`redirect:${path}`);
      });

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(calls).toEqual([
        "loginUser",
        "createSession",
        "redirect:/documents",
      ]);
    });
  });

  describe("loginUser errors", () => {
    it("returns the Error message when loginUser throws an Error", async () => {
      mockLoginUser.mockRejectedValue(
        new Error("Invalid email or password"),
      );

      const formData = createFormData(
        "user@example.com",
        "WrongPassword123!",
      );

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Invalid email or password",
      });

      expect(mockLoginUser).toHaveBeenCalledTimes(1);

      expect(mockCreateSession).not.toHaveBeenCalled();

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("converts a non-Error login failure to a string", async () => {
      mockLoginUser.mockRejectedValue(
        "Authentication service unavailable",
      );

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Authentication service unavailable",
      });

      expect(mockCreateSession).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does not create a session when loginUser fails", async () => {
      mockLoginUser.mockRejectedValue(
        new Error("Invalid credentials"),
      );

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(mockCreateSession).not.toHaveBeenCalled();
    });

    it("does not redirect when loginUser fails", async () => {
      mockLoginUser.mockRejectedValue(
        new Error("Invalid credentials"),
      );

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("createSession errors", () => {
    it("returns an error when createSession fails", async () => {
      mockLoginUser.mockResolvedValue({
        id: "user-123",
      } as any);

      mockCreateSession.mockRejectedValue(
        new Error("Failed to create session"),
      );

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      const result = await handleLogin(
        undefined,
        formData,
      );

      expect(result).toEqual({
        success: false,
        message: "Failed to create session",
      });

      expect(mockLoginUser).toHaveBeenCalledWith(
        "user@example.com",
        "Password123!",
      );

      expect(mockCreateSession).toHaveBeenCalledWith(
        "user-123",
      );

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does not redirect when session creation fails", async () => {
      mockLoginUser.mockResolvedValue({
        id: "user-123",
      } as any);

      mockCreateSession.mockRejectedValue(
        new Error("Session creation failed"),
      );

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(undefined, formData);

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Previous state", () => {
    it("accepts a previous login state", async () => {
      mockLoginUser.mockResolvedValue({
        id: "user-123",
      } as any);

      mockCreateSession.mockResolvedValue(undefined);

      const previousState = {
        success: false,
        message: "Previous login failed",
        errors: "",
      };

      const formData = createFormData(
        "user@example.com",
        "Password123!",
      );

      await handleLogin(previousState, formData);

      expect(mockLoginUser).toHaveBeenCalledWith(
        "user@example.com",
        "Password123!",
      );

      expect(mockCreateSession).toHaveBeenCalledWith(
        "user-123",
      );

      expect(mockRedirect).toHaveBeenCalledWith(
        "/documents",
      );
    });
  });
});

