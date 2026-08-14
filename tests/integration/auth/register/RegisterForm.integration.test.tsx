import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import RegisterForm from "@/features/auth/components/RegisterForm";

import {
  validRegistrationCredentials,
} from "../../../fixtures/auth/registration";

describe("RegisterForm Integration", () => {
  describe("rendering", () => {
    it("renders all registration controls", () => {
      render(<RegisterForm />);

      expect(
        screen.getByLabelText(/full name/i),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText(/email/i),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText(/^password$/i),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText(
          /confirm password/i,
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: /register/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("credential input", () => {
    it("allows users to enter registration details", async () => {
      const user = userEvent.setup();

      render(<RegisterForm />);

      const fullNameInput =
        screen.getByLabelText(/full name/i);

      const emailInput =
        screen.getByLabelText(/email/i);

      const passwordInput =
        screen.getByLabelText(/^password$/i);

      const confirmPasswordInput =
        screen.getByLabelText(
          /confirm password/i,
        );

      await user.type(
        fullNameInput,
        validRegistrationCredentials.fullName,
      );

      await user.type(
        emailInput,
        validRegistrationCredentials.email,
      );

      await user.type(
        passwordInput,
        validRegistrationCredentials.password,
      );

      await user.type(
        confirmPasswordInput,
        validRegistrationCredentials.confirmPassword,
      );

      expect(fullNameInput).toHaveValue(
        validRegistrationCredentials.fullName,
      );

      expect(emailInput).toHaveValue(
        validRegistrationCredentials.email,
      );

      expect(passwordInput).toHaveValue(
        validRegistrationCredentials.password,
      );

      expect(confirmPasswordInput).toHaveValue(
        validRegistrationCredentials.confirmPassword,
      );
    });
  });
});