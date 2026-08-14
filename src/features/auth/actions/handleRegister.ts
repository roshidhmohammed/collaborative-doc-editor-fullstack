"use server";

import { RegisterState } from "@/shared/types/actions";

import { redirect } from "next/navigation";
import { registerSchema } from "../validations/auth";
import { createUser } from "../services/createUser";

export async function handleRegister(
  prevState: RegisterState | undefined,
  formData: FormData,
) {
  const validatedFields = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message:
        "Missing Fields. Failed to Register a user. Please check and try again.",
    };
  }

  const { fullName, email, password } = validatedFields.data;

  try {
    const user = await createUser(fullName, email, password);
    if (!user) {
      redirect("/login");
      return;
    }
    return {
      message: "Registration successful!",
      success: true,
    };
  } catch (error) {
    if ((error as any)?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
