import bcrypt from "bcryptjs";

import prisma from "@/lib/db/prisma";

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