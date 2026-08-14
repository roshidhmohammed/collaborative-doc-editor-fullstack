"use server";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if the user already exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Full name, email, and password are required");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    throw error;
  }
}
