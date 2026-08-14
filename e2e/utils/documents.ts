import { Page, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// createDocument
// Navigates to /create-document, fills the title field, and submits.
// Waits for the redirect to the editor page (/documents/{id}/{token}).
// ---------------------------------------------------------------------------
export async function createDocument(
  page: Page,
  title: string,
): Promise<string> {
  await page.goto("/create-document");

  await page.locator("#title").fill(title);
  await page.getByRole("button", { name: /^create$/i }).click();

  // After creation the app redirects to the editor: /documents/{id}/{token}
  await expect(page).toHaveURL(/\/documents\/.+\/.+/, { timeout: 30_000 });

  return page.url();
}

// ---------------------------------------------------------------------------
// openDocument
// On the /documents listing page, finds a document card by title text and
// clicks it. Waits for the editor URL to appear.
// ---------------------------------------------------------------------------
export async function openDocument(page: Page, title: string): Promise<void> {
  await page.goto("/documents");

  // The document card renders the title in an h3.  The Link wrapping the card
  // navigates to the editor.  Click the card that contains the title text.
  const card = page
    .getByTestId("document-card")
    .filter({ hasText: title })
    .first();

  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();

  await expect(page).toHaveURL(/\/documents\/.+\/.+/, { timeout: 20_000 });
}

// ---------------------------------------------------------------------------
// findDocumentCard
// Returns the Locator for a document card that contains the given title text.
// Does not click it.
// ---------------------------------------------------------------------------
export function findDocumentCard(page: Page, title: string) {
  return page
    .getByTestId("document-card")
    .filter({ hasText: title })
    .first();
}

// ---------------------------------------------------------------------------
// waitForEditorReady
// Waits for the TipTap editor to finish initialising.
// ---------------------------------------------------------------------------
export async function waitForEditorReady(page: Page): Promise<void> {
  await expect(page.getByTestId("document-editor")).toBeVisible({
    timeout: 30_000,
  });

  // Wait for Socket.IO to connect so real-time features work
  await expect(page.getByTestId("realtime-status")).toContainText("connected", {
    timeout: 30_000,
  });
}
