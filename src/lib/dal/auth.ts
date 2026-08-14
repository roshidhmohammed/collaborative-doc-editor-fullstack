import "server-only";

import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getUser } from "./user";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    redirect("/login");
  }

  const session = await decrypt(cookie);

  if (!session) {
    redirect("/login");
  }

  if (!session?.userId || !session.exp || !getUser(session)) {
    redirect("/login");
  }

  if (session.exp * 1000 < Date.now()) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});
