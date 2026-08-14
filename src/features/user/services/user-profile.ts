"use server";

import { decrypt } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { cookies } from "next/headers";

export async function fetchUserProfile() {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    const userProfileData = await prisma.user.findUnique({
      where: {
        id: String(session?.userId),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });
    if (!userProfileData) {
      throw new Error("User not found");
    }
    return userProfileData;
  } catch (error) {
    throw error;
  }
}
