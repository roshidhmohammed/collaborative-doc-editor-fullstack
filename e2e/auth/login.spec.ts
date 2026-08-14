import { test, expect } from "@playwright/test";
import { registerUser } from "../utils/auth";
import { loginUserData1, registerUserData1 } from "../data/test-data";

/**
 * User Login
 *
 * Flow:
 *   /login → enter email → enter password → submit → /documents
 */
test.describe("User Login", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure User 1 exists; ignore errors if already registered.
    try {
      await registerUser(page, registerUserData1);
    } catch {
      // Already registered — fine.
    }
  });

  test("User 1 can login with valid credentials", async ({ page }) => {
    // Step 1 — Visit /login
    await page.goto("/login");

    // Step 2 — Enter email
    await page.locator("#email").fill(loginUserData1.email);

    // Step 3 — Enter password
    await page.locator("#password").fill(loginUserData1.password);

    // Step 4 — Submit
    await page.getByRole("button", { name: /^login$/i }).click();

    // Step 5–6 — Verify authenticated state and /documents redirect
    await expect(page).toHaveURL(/\/documents/, { timeout: 20_000 });
  });

  test("Authenticated user is redirected to /documents", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").fill(loginUserData1.email);
    await page.locator("#password").fill(loginUserData1.password);
    await page.getByRole("button", { name: /^login$/i }).click();

    await expect(page).toHaveURL(/\/documents/, { timeout: 20_000 });

    // Verify the documents page is actually rendered
    await expect(page.getByText("Your documents")).toBeVisible({
      timeout: 10_000,
    });
  });
});
