import bcrypt from "bcryptjs";

import prisma from "@/lib/db/prisma";

/**
 * Use a low cost factor in test environments for speed.
 * Set BCRYPT_SALT_ROUNDS=4 in .env.testing; leave unset in
 * production to fall back to the secure default of 12.
 */
const SALT_ROUNDS = parseInt(
  process.env.BCRYPT_SALT_ROUNDS ?? "12",
  10,
);

interface CreateUserOverrides {
  email?: string;
  fullName?: string;
  password?: string;
}

export async function createUser(
  overrides: CreateUserOverrides = {},
) {
  const password =
    overrides.password ?? "Password@123";

  const email =
    overrides.email ??
    `integration-${crypto.randomUUID()}@example.com`;

  const fullName =
    overrides.fullName ??
    "Integration Test User";

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      password: hashedPassword,
    },
  });

  return {
    user,
    password,
  };
}