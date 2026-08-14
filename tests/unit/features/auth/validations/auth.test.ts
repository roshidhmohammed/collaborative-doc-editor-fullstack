import {
  registerSchema,
  loginSchema,
  type RegisterFormValues,
  type LoginFormValues,
} from "@/features/auth/validations/auth";

describe("Auth validation schemas", () => {
  describe("registerSchema", () => {
    const validRegistrationData: RegisterFormValues = {
      fullName: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    };

    describe("Valid data", () => {
      it("accepts valid registration data", () => {
        const result = registerSchema.safeParse(
          validRegistrationData,
        );

        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data).toEqual(
            validRegistrationData,
          );
        }
      });

      it("accepts a two-character full name", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          fullName: "Jo",
        });

        expect(result.success).toBe(true);
      });

      it("accepts a 100-character full name", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          fullName: "A".repeat(100),
        });

        expect(result.success).toBe(true);
      });

      it("accepts a password with all required character types", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "Password1!",
          confirmPassword: "Password1!",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Full name validation", () => {
it("rejects an empty full name", () => {
  const result = registerSchema.safeParse({
    fullName: "",
    email: "test@example.com",
    password: "Password@123",
    confirmPassword: "Password@123",
  });

  expect(result.success).toBe(false);

  if (!result.success) {
    expect(
      result.error.flatten().fieldErrors.fullName,
    ).toContain(
      "Please enter a valid name with at least 2 characters and no more than 100 characters.",
    );
  }
});

      it("rejects a full name shorter than 2 characters", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          fullName: "A",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.fullName,
          ).toContain(
            "Please enter a valid name with at least 2 characters and no more than 100 characters.",
          );
        }
      });

      it("rejects a full name longer than 100 characters", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          fullName: "A".repeat(101),
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.fullName,
          ).toContain(
            "Please enter a valid name with at least 2 characters and no more than 100 characters.",
          );
        }
      });
    });

    describe("Email validation", () => {
      it("accepts a valid email", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          email: "user@example.com",
        });

        expect(result.success).toBe(true);
      });

      it("rejects an empty email", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          email: "",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.email,
          ).toContain(
            "Please enter your email address.",
          );
        }
      });

      it("rejects an invalid email", () => {
        const invalidEmails = [
          "invalid",
          "invalid@",
          "@example.com",
          "user@example",
          "user example@example.com",
        ];

        invalidEmails.forEach((email) => {
          const result = registerSchema.safeParse({
            ...validRegistrationData,
            email,
          });

          expect(result.success).toBe(false);
        });
      });

      it("returns the correct invalid email message", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          email: "invalid-email",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.email,
          ).toContain(
            "Please enter a valid email address.",
          );
        }
      });
    });

    describe("Password validation", () => {
      it("rejects an empty password", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "",
          confirmPassword: "",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.password,
          ).toContain(
            "Please enter your password.",
          );
        }
      });

      it("rejects a password shorter than 8 characters", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "Pass1!",
          confirmPassword: "Pass1!",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.password,
          ).toContain(
            "Password must be at least 8 characters long.",
          );
        }
      });

      it("accepts a password with exactly 8 characters", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "Pass123!",
          confirmPassword: "Pass123!",
        });

        expect(result.success).toBe(true);
      });

      it("rejects a password longer than 100 characters", () => {
        const password = `Aa1!${"a".repeat(97)}`;

        expect(password.length).toBeGreaterThan(100);

        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.password,
          ).toContain(
            "Password must not exceed 100 characters.",
          );
        }
      });

      it("accepts a password with exactly 100 characters", () => {
        const password = `Aa1!${"a".repeat(96)}`;

        expect(password.length).toBe(100);

        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(true);
      });

      it("rejects a password without an uppercase letter", () => {
        const password = "password123!";

        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.password,
          ).toContain(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
          );
        }
      });

      it("rejects a password without a lowercase letter", () => {
        const password = "PASSWORD123!";

        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(false);
      });

      it("rejects a password without a number", () => {
        const password = "Password!";

        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(false);
      });

      it("rejects a password without a special character", () => {
        const password = "Password123";

        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password,
          confirmPassword: password,
        });

        expect(result.success).toBe(false);
      });

      it.each([
        "Password123!",
        "Password123@",
        "Password123#",
        "Password123$",
        "Password123%",
        "Password123&",
        "Password123*",
        "Password123?",
        "Password123^",
      ])(
        "accepts supported special character in password: %s",
        (password) => {
          const result = registerSchema.safeParse({
            ...validRegistrationData,
            password,
            confirmPassword: password,
          });

          expect(result.success).toBe(true);
        },
      );
    });

    describe("Confirm password validation", () => {
      it("rejects an empty confirm password", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          confirmPassword: "",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors
              .confirmPassword,
          ).toContain(
            "Please confirm your password.",
          );
        }
      });

      it("rejects mismatched passwords", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "Password123!",
          confirmPassword: "Different123!",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors
              .confirmPassword,
          ).toContain("Passwords do not match.");
        }
      });

      it("accepts matching passwords", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "Password123!",
          confirmPassword: "Password123!",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Required fields", () => {
      it("rejects completely empty registration data", () => {
        const result = registerSchema.safeParse({});

        expect(result.success).toBe(false);

        if (!result.success) {
          const errors =
            result.error.flatten().fieldErrors;

          expect(errors.fullName).toBeDefined();
          expect(errors.email).toBeDefined();
          expect(errors.password).toBeDefined();
          expect(errors.confirmPassword).toBeDefined();
        }
      });
    });

    describe("Error paths", () => {
      it("places password mismatch error on confirmPassword", () => {
        const result = registerSchema.safeParse({
          ...validRegistrationData,
          password: "Password123!",
          confirmPassword: "Different123!",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.issues.some(
              (issue) =>
                issue.path[0] === "confirmPassword" &&
                issue.message ===
                  "Passwords do not match.",
            ),
          ).toBe(true);
        }
      });
    });
  });

  describe("loginSchema", () => {
    const validLoginData: LoginFormValues = {
      email: "john@example.com",
      password: "Password123!",
    };

    describe("Valid data", () => {
      it("accepts valid login credentials", () => {
        const result = loginSchema.safeParse(
          validLoginData,
        );

        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data).toEqual(validLoginData);
        }
      });

      it("accepts a valid email and strong password", () => {
        const result = loginSchema.safeParse({
          email: "user@example.com",
          password: "SecurePass123!",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("Email validation", () => {
      it("rejects a missing email", () => {
        const result = loginSchema.safeParse({
          password: validLoginData.password,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.email,
          ).toBeDefined();
        }
      });

      it("rejects an invalid email", () => {
        const result = loginSchema.safeParse({
          email: "invalid-email",
          password: validLoginData.password,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.email,
          ).toContain(
            "Please enter a valid email address.",
          );
        }
      });
    });

    describe("Password validation", () => {
      it("rejects a missing password", () => {
        const result = loginSchema.safeParse({
          email: validLoginData.email,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.password,
          ).toBeDefined();
        }
      });

      it("rejects a weak password", () => {
        const result = loginSchema.safeParse({
          email: validLoginData.email,
          password: "password",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
          expect(
            result.error.flatten().fieldErrors.password,
          ).toBeDefined();
        }
      });

      it("rejects a password shorter than 8 characters", () => {
        const result = loginSchema.safeParse({
          email: validLoginData.email,
          password: "Pass1!",
        });

        expect(result.success).toBe(false);
      });

      it("rejects a password without a number", () => {
        const result = loginSchema.safeParse({
          email: validLoginData.email,
          password: "Password!",
        });

        expect(result.success).toBe(false);
      });

      it("rejects a password without a special character", () => {
        const result = loginSchema.safeParse({
          email: validLoginData.email,
          password: "Password123",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Required fields", () => {
      it("rejects completely empty login data", () => {
        const result = loginSchema.safeParse({});

        expect(result.success).toBe(false);

        if (!result.success) {
          const errors =
            result.error.flatten().fieldErrors;

          expect(errors.email).toBeDefined();
          expect(errors.password).toBeDefined();
        }
      });

      it("does not require confirmPassword for login", () => {
        const result = loginSchema.safeParse({
          email: "john@example.com",
          password: "Password123!",
          confirmPassword: "",
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Schema isolation", () => {
    it("does not apply confirmPassword validation to loginSchema", () => {
      const result = loginSchema.safeParse({
        email: "john@example.com",
        password: "Password123!",
      });

      expect(result.success).toBe(true);
    });

    it("requires confirmPassword for registerSchema", () => {
      const result = registerSchema.safeParse({
        fullName: "John Doe",
        email: "john@example.com",
        password: "Password123!",
      });

      expect(result.success).toBe(false);
    });
  });
});