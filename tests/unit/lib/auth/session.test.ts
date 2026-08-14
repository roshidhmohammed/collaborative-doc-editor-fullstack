import { cookies } from "next/headers";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockSign = jest.fn();
const mockJwtVerify = jest.fn();

jest.doMock("jose", () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: mockSign,
  })),

  jwtVerify: mockJwtVerify,
}));

const {
  encrypt,
  decrypt,
  createSession,
  updateSession,
  deleteSession,
  getCookies,
} = require("@/lib/auth/session");

const mockCookies = cookies as jest.MockedFunction<
  typeof cookies
>;

describe("Session utilities", () => {
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCookies.mockResolvedValue(
      mockCookieStore as any,
    );

    mockSign.mockResolvedValue(
      "mock-session-token",
    );

    mockJwtVerify.mockResolvedValue({
      payload: {
        userId: "user-123",
      },
    });
  });

  describe("encrypt", () => {
    it("returns the signed JWT token", async () => {
      mockSign.mockResolvedValueOnce(
        "signed-token-123",
      );

      const result = await encrypt({
        userId: "user-123",
        expiresAt: new Date(),
      });

      expect(result).toBe(
        "signed-token-123",
      );

      expect(mockSign).toHaveBeenCalledTimes(1);
    });

    it("uses HS256 as the signing algorithm", async () => {
      const setProtectedHeader = jest
        .fn()
        .mockReturnThis();

      const SignJWT = require("jose").SignJWT;

      SignJWT.mockImplementationOnce(() => ({
        setProtectedHeader,
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest
          .fn()
          .mockReturnThis(),
        sign: mockSign,
      }));

      await encrypt({
        userId: "user-123",
        expiresAt: new Date(),
      });

      expect(
        setProtectedHeader,
      ).toHaveBeenCalledWith({
        alg: "HS256",
      });
    });

    it("sets the issued-at timestamp", async () => {
      const setIssuedAt = jest
        .fn()
        .mockReturnThis();

      const SignJWT = require("jose").SignJWT;

      SignJWT.mockImplementationOnce(() => ({
        setProtectedHeader: jest
          .fn()
          .mockReturnThis(),

        setIssuedAt,

        setExpirationTime: jest
          .fn()
          .mockReturnThis(),

        sign: mockSign,
      }));

      await encrypt({
        userId: "user-123",
        expiresAt: new Date(),
      });

      expect(
        setIssuedAt,
      ).toHaveBeenCalledTimes(1);
    });

    it("sets the JWT expiration to 30 minutes", async () => {
      const setExpirationTime = jest
        .fn()
        .mockReturnThis();

      const SignJWT = require("jose").SignJWT;

      SignJWT.mockImplementationOnce(() => ({
        setProtectedHeader: jest
          .fn()
          .mockReturnThis(),

        setIssuedAt: jest
          .fn()
          .mockReturnThis(),

        setExpirationTime,

        sign: mockSign,
      }));

      await encrypt({
        userId: "user-123",
        expiresAt: new Date(),
      });

      expect(
        setExpirationTime,
      ).toHaveBeenCalledWith("30m");
    });

    it("passes the session payload to SignJWT", async () => {
      const SignJWT = require("jose").SignJWT;

      const payload = {
        userId: "user-123",
        expiresAt: new Date(),
      };

      SignJWT.mockImplementationOnce(
        (receivedPayload: unknown) => {
          expect(receivedPayload).toEqual(
            payload,
          );

          return {
            setProtectedHeader: jest
              .fn()
              .mockReturnThis(),

            setIssuedAt: jest
              .fn()
              .mockReturnThis(),

            setExpirationTime: jest
              .fn()
              .mockReturnThis(),

            sign: mockSign,
          };
        },
      );

      await encrypt(payload);
    });

    it("propagates signing errors", async () => {
      mockSign.mockRejectedValueOnce(
        new Error("Signing failed"),
      );

      await expect(
        encrypt({
          userId: "user-123",
          expiresAt: new Date(),
        }),
      ).rejects.toThrow("Signing failed");
    });
  });

  describe("decrypt", () => {
    it("returns the JWT payload for a valid token", async () => {
      mockJwtVerify.mockResolvedValueOnce({
        payload: {
          userId: "user-123",
        },
      });

      const result = await decrypt(
        "valid-token",
      );

      expect(result).toEqual({
        userId: "user-123",
      });
    });

it("passes the token to jwtVerify", async () => {
  await decrypt("session-token");

  expect(mockJwtVerify).toHaveBeenCalledTimes(1);

  const [token, encodedKey, options] =
    mockJwtVerify.mock.calls[0];

  expect(token).toBe("session-token");

  expect(encodedKey).toBeDefined();

  expect(
    ArrayBuffer.isView(encodedKey) ||
      Array.isArray(encodedKey),
  ).toBe(true);

  expect(options).toEqual({
    algorithms: ["HS256"],
  });
});

    it("returns undefined for an invalid token", async () => {
      mockJwtVerify.mockRejectedValueOnce(
        new Error("Invalid token"),
      );

      const result = await decrypt(
        "invalid-token",
      );

      expect(result).toBeUndefined();
    });

    it("returns undefined when no token is provided", async () => {
      mockJwtVerify.mockRejectedValueOnce(
        new Error("Invalid token"),
      );

      const result = await decrypt();

      expect(result).toBeUndefined();
    });

    it("returns undefined for an expired token", async () => {
      mockJwtVerify.mockRejectedValueOnce(
        new Error("JWT expired"),
      );

      const result = await decrypt(
        "expired-token",
      );

      expect(result).toBeUndefined();
    });
  });

  describe("createSession", () => {
    it("creates a session token", async () => {
      await createSession("user-123");

      expect(mockSign).toHaveBeenCalledTimes(1);
    });

    it("sets the session cookie", async () => {
      await createSession("user-123");

      expect(
        mockCookieStore.set,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCookieStore.set,
      ).toHaveBeenCalledWith(
        "session",
        "mock-session-token",
        expect.any(Object),
      );
    });

    it("stores the correct user id in the session payload", async () => {
      const SignJWT = require("jose").SignJWT;

      let receivedPayload: unknown;

      SignJWT.mockImplementationOnce(
        (payload: unknown) => {
          receivedPayload = payload;

          return {
            setProtectedHeader: jest
              .fn()
              .mockReturnThis(),

            setIssuedAt: jest
              .fn()
              .mockReturnThis(),

            setExpirationTime: jest
              .fn()
              .mockReturnThis(),

            sign: mockSign,
          };
        },
      );

      await createSession("user-123");

      expect(receivedPayload).toEqual(
        expect.objectContaining({
          userId: "user-123",
        }),
      );
    });

    it("sets httpOnly to true", async () => {
      await createSession("user-123");

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options).toEqual(
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });

    it("sets secure to true", async () => {
      await createSession("user-123");

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options).toEqual(
        expect.objectContaining({
          secure: true,
        }),
      );
    });

    it("sets SameSite to lax", async () => {
      await createSession("user-123");

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options).toEqual(
        expect.objectContaining({
          sameSite: "lax",
        }),
      );
    });

    it("sets the cookie path to root", async () => {
      await createSession("user-123");

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options).toEqual(
        expect.objectContaining({
          path: "/",
        }),
      );
    });

    it("sets an expiration date", async () => {
      await createSession("user-123");

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options.expires).toEqual(
        expect.any(Date),
      );
    });
  });

  describe("updateSession", () => {
    it("returns null when there is no session", async () => {
      mockCookieStore.get.mockReturnValue(
        undefined,
      );

      const result =
        await updateSession();

      expect(result).toBeNull();

      expect(
        mockCookieStore.set,
      ).not.toHaveBeenCalled();
    });

    it("returns null for an invalid session", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "invalid-token",
      });

      mockJwtVerify.mockRejectedValueOnce(
        new Error("Invalid token"),
      );

      const result =
        await updateSession();

      expect(result).toBeNull();

      expect(
        mockCookieStore.set,
      ).not.toHaveBeenCalled();
    });

    it("refreshes a valid session", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "valid-token",
      });

      mockJwtVerify.mockResolvedValueOnce({
        payload: {
          userId: "user-123",
        },
      });

      await updateSession();

      expect(
        mockCookieStore.set,
      ).toHaveBeenCalledTimes(1);
    });

    it("keeps the existing session token", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "existing-token",
      });

      await updateSession();

      expect(
        mockCookieStore.set,
      ).toHaveBeenCalledWith(
        "session",
        "existing-token",
        expect.any(Object),
      );
    });

    it("updates the expiration date", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "existing-token",
      });

      await updateSession();

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options.expires).toEqual(
        expect.any(Date),
      );
    });

    it("preserves cookie security options", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "existing-token",
      });

      await updateSession();

      const [, , options] =
        mockCookieStore.set.mock.calls[0];

      expect(options).toEqual(
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
        }),
      );
    });
  });

  describe("deleteSession", () => {
    it("deletes the session cookie", async () => {
      await deleteSession();

      expect(
        mockCookieStore.delete,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCookieStore.delete,
      ).toHaveBeenCalledWith(
        "session",
      );
    });
  });

  describe("getCookies", () => {
    it("returns the session cookie value", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "session-token",
      });

      const result =
        await getCookies();

      expect(result).toBe(
        "session-token",
      );
    });

    it("reads the session cookie", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "session-token",
      });

      await getCookies();

      expect(
        mockCookieStore.get,
      ).toHaveBeenCalledWith(
        "session",
      );
    });

    it("returns undefined when there is no session", async () => {
      mockCookieStore.get.mockReturnValue(
        undefined,
      );

      const result =
        await getCookies();

      expect(result).toBeUndefined();
    });
  });
});