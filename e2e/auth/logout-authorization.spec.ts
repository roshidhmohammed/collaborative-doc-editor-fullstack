import { test, expect } from "@playwright/test";
import { registerUser, loginUser, logoutUser } from "../utils/auth";
import { loginUserData1, registerUserData1 } from "../data/test-data";

/**
 * Logout and Protected Route Authorization
 *
 * Flow:
 *   Authenticated User → profile menu → Logout → /login
 *   → navigate to /documents → still redirected to /login
 */
test.describe("Logout and Authorization", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure User 1 exists and is logged in
    try {
      await registerUser(page, registerUserData1);
    } catch {
      // Already registered — fine.
    }
    await loginUser(page, loginUserData1);
  });

  test("User 1 can logout via the profile menu", async ({ page }) => {
    // Verify we are on the documents page (logged in)
    await expect(page).toHaveURL(/\/documents/, { timeout: 20_000 });

    // Step 1 — Open the profile menu
    await page.getByRole("button", { name: /open profile menu/i }).click();

    // Step 2 — Click Logout
    await page.getByTestId("logout-button").click();

    // Step 3–4 — Verify redirect to /login (session destroyed)
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });

  test("Logged-out user cannot access /documents and is redirected to /login", async ({
    page,
  }) => {
    // Logout first
    await logoutUser(page);

    // Step 5 — Navigate directly to the protected /documents page
    await page.goto("/documents");

    // Step 6–7 — Unauthenticated user must be redirected to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });
});

test.describe("Cold Unauthenticated Access", () => {
  test("Unauthenticated visitor cannot access /documents", async ({ page }) => {
    // This test does NOT pre-authenticate — it tests cold unauthenticated access.
    // Navigate directly to /documents without a session.
    await page.goto("/documents");
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });
});
