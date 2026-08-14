import { test as base, expect } from "@playwright/test";
import { registerUser, loginUser } from "../utils/auth";
import {
  loginUserData1,
  registerUserData1,
} from "../data/test-data";

// ---------------------------------------------------------------------------
// authenticatedUser1 fixture
//
// Ensures User 1 is registered and logged-in before the test body runs.
// Each test gets a fresh page; the fixture handles the auth boilerplate.
// ---------------------------------------------------------------------------
type AuthFixtures = {
  /** A page authenticated as User 1. */
  authenticatedUser1: void;
};

export const test = base.extend<AuthFixtures>({
  authenticatedUser1: async ({ page }, use) => {
    // Attempt login first (user may already exist from a previous run).
    // If login fails (e.g. first run), fall back to register then login.
    try {
      await loginUser(page, loginUserData1);
    } catch {
      // Registration may also fail if the user already exists — that is fine;
      // in that case login above would have succeeded and we wouldn't be here.
      try {
        await registerUser(page, registerUserData1);
      } catch {
        // User already registered — proceed.
      }
      await loginUser(page, loginUserData1);
    }

    await use();
  },
});

export { expect };
