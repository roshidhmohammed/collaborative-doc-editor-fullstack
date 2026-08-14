import { test, expect } from "@playwright/test";
import { registerUser, loginUser } from "../utils/auth";
import { createDocument, openDocument, waitForEditorReady } from "../utils/documents";
import { loginUserData1, registerUserData1, docDetails1 } from "../data/test-data";

/**
 * Update and Persist Document Content
 *
 * Flow:
 *   /documents → find "AI" → open → editor → type "Hello"
 *   → wait for persistence → refresh → verify "Hello" still present
 */
test.describe("User can update and persist document content", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure User 1 is registered and authenticated
    try {
      await registerUser(page, registerUserData1);
    } catch {
      // Already registered.
    }
    await loginUser(page, loginUserData1);
  });

  test('User 1 can type "Hello" and content persists after a page refresh', async ({
    page,
  }) => {
    // Setup — ensure the document "AI" exists
    // createDocument navigates to /create-document and submits the form.
    // If the document already exists from a previous test, we rely on
    // openDocument to find it by title on /documents.
    let editorUrl: string;
    try {
      editorUrl = await createDocument(page, docDetails1.title);
    } catch {
      // Document may already exist — open it from the list instead
      await openDocument(page, docDetails1.title);
      editorUrl = page.url();
    }

    // Step 5 — Verify editor page is open
    await expect(page).toHaveURL(/\/documents\/.+\/.+/, { timeout: 20_000 });

    // Wait for Socket.IO to connect and the editor to initialise
    await waitForEditorReady(page);

    // Step 6 — Click into the editor and type "Hello"
    const editorContent = page
      .getByTestId("editor-content")
      .locator(".ProseMirror");

    // Wait for the editor to become editable
    await expect(editorContent).toHaveAttribute("contenteditable", "true", { timeout: 15_000 });

    await editorContent.click();
    await page.keyboard.type("Hello");

    // Step 7 — Wait for the content to appear in the editor DOM
    await expect(editorContent).toContainText("Hello", { timeout: 15_000 });

    // Wait a moment for the Socket.IO `document:update` to be acknowledged
    // by the backend (we observe this implicitly — the realtime-status stays
    // "connected" meaning the socket is still active and the update was sent).
    await expect(page.getByTestId("realtime-status")).toContainText(
      "connected",
      { timeout: 10_000 },
    );

    // Step 8 — Refresh the page
    await page.reload({ waitUntil: "domcontentloaded" });

    // Step 9 — Wait for editor to re-initialise after reload
    await waitForEditorReady(page);

    // Verify "Hello" is still present (content was persisted via Socket.IO backend)
    const editorContentAfterReload = page
      .getByTestId("editor-content")
      .locator(".ProseMirror");

    await expect(editorContentAfterReload).toContainText("Hello", {
      timeout: 20_000,
    });
  });
});
