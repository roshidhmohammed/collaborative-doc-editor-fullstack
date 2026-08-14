import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "@/features/auth/components/LoginForm";

import { validLoginCredentials } from "../../../fixtures/auth/credentials";

describe("LoginForm Integration", () => {
  describe("rendering", () => {
    it("renders the login form controls", () => {
      render(<LoginForm />);

      expect(
        screen.getByRole("textbox", {
          name: /email address/i,
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByLabelText(/password/i),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: /login/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("credential input", () => {
    it("allows users to enter their credentials", async () => {
      const user = userEvent.setup();

      render(<LoginForm />);

      const emailInput = screen.getByRole(
        "textbox",
        {
          name: /email address/i,
        },
      );

      const passwordInput =
        screen.getByLabelText(/password/i);

      await user.type(
        emailInput,
        validLoginCredentials.email,
      );

      await user.type(
        passwordInput,
        validLoginCredentials.password,
      );

      expect(emailInput).toHaveValue(
        validLoginCredentials.email,
      );

      expect(passwordInput).toHaveValue(
        validLoginCredentials.password,
      );
    });
  });
});