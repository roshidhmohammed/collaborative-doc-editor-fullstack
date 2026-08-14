import { deleteSession } from "@/lib/auth/session";
import { redirect, RedirectType } from "next/navigation";

import { handleLogout } from "@/features/user/actions/logout";

jest.mock("@/lib/auth/session", () => ({
  deleteSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  RedirectType: {
    push: "push",
    replace: "replace",
  },
}));

describe("handleLogout", () => {
  const mockDeleteSession =
    deleteSession as jest.MockedFunction<typeof deleteSession>;

  const mockRedirect =
    redirect as jest.MockedFunction<typeof redirect>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Important:
    // redirect should NOT throw by default.
    mockRedirect.mockImplementation(() => undefined as never);

    mockDeleteSession.mockResolvedValue(undefined);
  });

  describe("Successful logout", () => {
    it("calls deleteSession", async () => {
      await handleLogout();

      expect(mockDeleteSession).toHaveBeenCalledTimes(1);
    });

    it("calls deleteSession without arguments", async () => {
      await handleLogout();

      expect(mockDeleteSession).toHaveBeenCalledWith();
    });

    it("redirects to the login page", async () => {
      await handleLogout();

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
        RedirectType.replace,
      );
    });

    it("uses replace redirect type", async () => {
      await handleLogout();

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
        "replace",
      );
    });

    it("deletes the session before redirecting", async () => {
      const executionOrder: string[] = [];

      mockDeleteSession.mockImplementation(async () => {
        executionOrder.push("deleteSession");
      });

      mockRedirect.mockImplementation(() => {
        executionOrder.push("redirect");
        return undefined as never;
      });

      await handleLogout();

      expect(executionOrder).toEqual([
        "deleteSession",
        "redirect",
      ]);
    });
  });

  describe("Session deletion failures", () => {
    it("propagates the deleteSession error", async () => {
      const error = new Error(
        "Failed to delete session",
      );

      mockDeleteSession.mockRejectedValue(error);

      await expect(handleLogout()).rejects.toThrow(
        "Failed to delete session",
      );
    });

    it("does not redirect when deleteSession fails", async () => {
      mockDeleteSession.mockRejectedValue(
        new Error("Session deletion failed"),
      );

      await expect(handleLogout()).rejects.toThrow(
        "Session deletion failed",
      );

      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Redirect behavior", () => {
    it("redirects exactly once", async () => {
      await handleLogout();

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
        RedirectType.replace,
      );
    });

    it("redirects to exactly /login", async () => {
      await handleLogout();

      expect(mockRedirect).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
        RedirectType.replace,
      );

      expect(mockRedirect).not.toHaveBeenCalledWith(
        "/",
        expect.anything(),
      );
    });
  });

  describe("Next.js redirect behavior", () => {
    it("handles the Next.js redirect exception", async () => {
      mockRedirect.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(handleLogout()).rejects.toThrow(
        "NEXT_REDIRECT",
      );

      expect(mockDeleteSession).toHaveBeenCalledTimes(1);

      expect(mockRedirect).toHaveBeenCalledWith(
        "/login",
        RedirectType.replace,
      );
    });

    it("does not call redirect more than once", async () => {
      mockRedirect.mockImplementation(() => {
        throw new Error("NEXT_REDIRECT");
      });

      await expect(handleLogout()).rejects.toThrow(
        "NEXT_REDIRECT",
      );

      expect(mockRedirect).toHaveBeenCalledTimes(1);
    });
  });
});