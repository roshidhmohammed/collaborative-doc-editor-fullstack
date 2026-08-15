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

  const saltRounds =
    process.env.NODE_ENV === "testing" ? 4 : 12;

  const hashedPassword =
    await bcrypt.hash(password, saltRounds);

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