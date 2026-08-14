import { SignJWT } from "jose";

import type {
  createCookieStore,
} from "../mocks/next/headers.mock";

type CookieStore = ReturnType<
  typeof createCookieStore
>;

interface TestSessionPayload {
  userId: string;
  expiresAt?: Date;
}

const sessionSecret =
  process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET is required for integration tests",
  );
}

const encodedKey =
  new TextEncoder().encode(
    sessionSecret,
  );

export async function createTestSessionToken(
  userId: string,
  expiresAt = new Date(
    Date.now() +
      7 * 24 * 60 * 60 * 1000,
  ),
) {
  return new SignJWT({
    userId,
    expiresAt,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(encodedKey);
}

export async function setAuthenticatedSession(
  cookieStore: CookieStore,
  userId: string,
) {
  const session =
    await createTestSessionToken(
      userId,
    );

  cookieStore.set(
    "session",
    session,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    },
  );

  return session;
}

export function clearAuthenticatedSession(
  cookieStore: CookieStore,
) {
  cookieStore.clear();
}