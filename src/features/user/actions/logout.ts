"use server";

import { deleteSession } from "@/lib/auth/session";
import { redirect, RedirectType } from "next/navigation";

export async function handleLogout() {
  await deleteSession();
  redirect("/login", RedirectType.replace);
}
