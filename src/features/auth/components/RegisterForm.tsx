"use client";

import Button from "@/shared/components/Button";
import FormField from "@/shared/components/FormField";
import Input from "@/shared/components/Input";
import PasswordInput from "@/shared/components/PasswordInput";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { handleRegister } from "../actions/handleRegister";

export default function RegisterForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    handleRegister,
    undefined,
  );

  useEffect(() => {
    if (errorMessage && errorMessage?.success) {
      toast.success("Registration Successful");
    } else if (errorMessage && !errorMessage?.success) {
      toast.error(errorMessage?.message);
    }
  }, [errorMessage]);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Full Name" htmlFor="fullName" required>
        <Input
          id="fullName"
          name="fullName"
          placeholder="John Doe"
          error={errorMessage?.errors && errorMessage.errors.fullName?.[0]}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="john@gmail.com"
          error={errorMessage?.errors && errorMessage.errors.email?.[0]}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" required>
        <PasswordInput
          id="password"
          name="password"
          error={errorMessage?.errors && errorMessage.errors.password?.[0]}
        />
      </FormField>

      <FormField label="Confirm Password" htmlFor="confirmPassword" required>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          error={
            errorMessage?.errors && errorMessage.errors.confirmPassword?.[0]
          }
        />
      </FormField>

      <Button type="submit" loading={isPending}>
        Register
      </Button>
    </form>
  );
}
