import { Page, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type LoginData = {
  email: string;
  password: string;
};

// ---------------------------------------------------------------------------
// registerUser
// Fills the /register form and submits. Waits for redirect to /login.
// ---------------------------------------------------------------------------
export async function registerUser(page: Page, data: RegisterData): Promise<void> {
  await page.goto("/register");

  await page.locator("#fullName").fill(data.fullName);
  await page.locator("#email").fill(data.email);
  await page.locator("#password").fill(data.password);
  await page.locator("#confirmPassword").fill(data.confirmPassword);

  await page.getByRole("button", { name: /register/i }).click();

  // Handle case where user already exists since database cleanup is removed
  const errorToast = page.locator("text=A user with this email already exists.");
  await Promise.race([
    expect(page).toHaveURL(/\/login/, { timeout: 20_000 }),
    expect(errorToast).toBeVisible({ timeout: 20_000 }),
  ]);

  if (await errorToast.isVisible()) {
    await page.goto("/login");
  }
}

// ---------------------------------------------------------------------------
// loginUser
// Fills the /login form and submits. Waits for redirect to /documents.
// ---------------------------------------------------------------------------
export async function loginUser(page: Page, data: LoginData): Promise<void> {
  await page.goto("/login");

  await page.locator("#email").fill(data.email);
  await page.locator("#password").fill(data.password);

  await page.getByRole("button", { name: /^login$/i }).click();

  // After successful login the server redirects to /documents
  await expect(page).toHaveURL(/\/documents/, { timeout: 30_000 });
}

// ---------------------------------------------------------------------------
// logoutUser
// Opens the profile menu and clicks Logout. Waits for redirect to /login.
// ---------------------------------------------------------------------------
export async function logoutUser(page: Page): Promise<void> {
  // Open profile menu via the aria-label button
  await page.getByRole("button", { name: /open profile menu/i }).click();

  // Wait for the modal to appear then click logout
  await page.getByTestId("logout-button").click();

  // After logout the server redirects to /login
  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
}
