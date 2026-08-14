"use client";

import Button from "@/shared/components/Button";
import FormField from "@/shared/components/FormField";
import Input from "@/shared/components/Input";
import PasswordInput from "@/shared/components/PasswordInput";
import { useActionState } from "react";
import { handleLogin } from "../actions/handleLogin";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    handleLogin,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5  text-white">
      {/* Email */}

      <FormField label="Email Address" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="john@example.com"
          autoComplete="email"
          // error={errorMessage?.errors && errorMessage.errors.email?.[0]}
        />
      </FormField>

      {/* Password */}

      <FormField label="Password" htmlFor="password" required>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          // error={errorMessage?.errors && errorMessage.errors.password?.[0]}
        />
      </FormField>

      {/* Login Button */}
      <Button type="submit" loading={isPending}>
        Login
      </Button>
    </form>
  );
}
