import { test, expect } from "@playwright/test";
import { registerUser } from "../utils/auth";
import { loginUser } from "../utils/auth";
import { registerUserData1, loginUserData1 } from "../data/test-data";

/**
 * User Registration
 *
 * Flow:
 *   / → Click "Register" link → /register form → fill registerUserData1 → submit
 *   → redirect to /login (registration success)
 */
test.describe("User Registration", () => {
  test("User 1 can register from the home page", async ({ page }) => {
    // Step 1 — Visit home page
    await page.goto("/");

    // Step 2 — Click the Register button/link
    await page.getByRole("link", { name: /register/i }).click();
    await expect(page).toHaveURL(/\/register/, { timeout: 10_000 });

    // Step 3–4 — Fill and submit the registration form using test data
    await page.locator("#fullName").fill(registerUserData1.fullName);
    await page.locator("#email").fill(registerUserData1.email);
    await page.locator("#password").fill(registerUserData1.password);
    await page.locator("#confirmPassword").fill(registerUserData1.confirmPassword);

    await page.getByRole("button", { name: /register/i }).click();

    // Verify registration success (either redirects to /login, or shows "A user with this email already exists.")
    const errorToast = page.locator("text=A user with this email already exists.");
    await Promise.race([
      expect(page).toHaveURL(/\/login/, { timeout: 20_000 }),
      expect(errorToast).toBeVisible({ timeout: 20_000 }),
    ]);

    if (await errorToast.isVisible()) {
      await page.goto("/login");
    }
  });

  test("Registered User 1 can then login", async ({ page }) => {
    // This verifies the registration created a real, working account.
    // registerUser may throw if the user already exists; we catch that.
    try {
      await registerUser(page, registerUserData1);
    } catch {
      // Already registered from the previous test — that is fine.
    }

    await loginUser(page, loginUserData1);

    await expect(page).toHaveURL(/\/documents/, { timeout: 20_000 });
  });
});
