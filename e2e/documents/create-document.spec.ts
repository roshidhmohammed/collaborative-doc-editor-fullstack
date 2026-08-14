import { test, expect } from "@playwright/test";
import { registerUser, loginUser } from "../utils/auth";
import { createDocument } from "../utils/documents";
import { findDocumentCard } from "../utils/documents";
import { loginUserData1, registerUserData1, docDetails1 } from "../data/test-data";

/**
 * Create Document
 *
 * Flow:
 *   User 1 authenticated → /documents → Create Document → enter "AI"
 *   → submit → /documents → Document "AI" visible
 */
test.describe("Authenticated user can create a document", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure User 1 is registered and authenticated
    try {
      await registerUser(page, registerUserData1);
    } catch {
      // Already registered.
    }
    await loginUser(page, loginUserData1);
  });

  test('User 1 can create a document titled "AI"', async ({ page }) => {
    // Step 1–4 — Navigate to /create-document and fill/submit the form
    await createDocument(page, docDetails1.title);

    // The app redirects to the editor after creation — go back to /documents
    await page.goto("/documents");

    // Step 5–7 — Verify the document card with title "AI" is visible
    const card = findDocumentCard(page, docDetails1.title);
    await expect(card).toBeVisible({ timeout: 15_000 });

    // Also verify the title text is correct
    await expect(card.locator("h3")).toContainText(docDetails1.title);
  });

  test("Create Document button navigates to the creation form", async ({
    page,
  }) => {
    await page.goto("/documents");

    // Click the "Create new document" card
    const createCard = page.getByTestId("create-document-card");
    await expect(createCard).toBeVisible({ timeout: 10_000 });
    await createCard.click();

    await expect(page).toHaveURL(/\/create-document/, { timeout: 10_000 });

    // The title field should be present
    await expect(page.locator("#title")).toBeVisible();
  });
});
