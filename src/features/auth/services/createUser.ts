"use server";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function createUser(
  fullName: string,
  email: string,
  password: string,
) {
  try {
    if (!fullName || !email || !password) {
      throw new Error("Full name, email, and password are required");
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  } catch (error) {
    throw error;
  }
}
