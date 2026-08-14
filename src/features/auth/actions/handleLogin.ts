"use server";

import { loginState } from "@/shared/types/actions";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "../validations/auth";
import { loginUser } from "../services/loginUser";

export async function handleLogin(
  prevState: loginState | undefined,
  formData: FormData,
) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Login. Please check and try again.",
    };
  }
  const { email, password } = validatedFields.data;
  try {
    const res = await loginUser(email, password);
    if (res) {
      await createSession(res?.id);
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
  redirect("/documents");
}
