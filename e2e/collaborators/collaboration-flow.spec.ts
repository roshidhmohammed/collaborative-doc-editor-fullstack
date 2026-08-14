import { test, expect } from "../fixtures/collaboration.fixture";
import { getShareLink, waitForEditorContent } from "../utils/collaboration";
import { createDocument, openDocument, waitForEditorReady } from "../utils/documents";
import { registerUser, loginUser } from "../utils/auth";
import {
  registerUserData2,
  loginUserData2,
  registerUserData3,
  loginUserData3,
  docDetails1,
} from "../data/test-data";


test.describe("Real-Time Multi-User Collaboration Flow", () => {
  test("Complete collaboration flow (Viewer and Editor permissions, real-time sync)", async ({
    browser,
    user1Ctx,
  }) => {
    // ---------------------------------------------------------------------------
    // Step 1: User 1 sets up the document
    // ---------------------------------------------------------------------------
    const page1 = user1Ctx.page;
    let editorUrl: string;
    try {
      editorUrl = await createDocument(page1, docDetails1.title);
    } catch {
      await openDocument(page1, docDetails1.title);
      editorUrl = page1.url();
    }

    await waitForEditorReady(page1);

    // Initial content setup by User 1
    const user1Editor = page1.getByTestId("editor-content").locator(".ProseMirror");
    await expect(user1Editor).toHaveAttribute("contenteditable", "true", { timeout: 15_000 });
    await user1Editor.click();
    await page1.keyboard.press("Control+A");
    await page1.keyboard.press("Backspace");
    await page1.keyboard.type("Hello");

    // Wait for in-memory TipTap editor to sync
    await expect(user1Editor).toContainText("Hello", { timeout: 15_000 });

    // ---------------------------------------------------------------------------
    // Flow 5A — User 1 Generates Viewer Share Link
    // ---------------------------------------------------------------------------
    const viewerShareUrl = await getShareLink(page1, "VIEWER");
    expect(viewerShareUrl).toContain("/documents/");

    // ---------------------------------------------------------------------------
    // Flow 5B — User 2 Opens Viewer Share Link (Unauthenticated -> Redirect)
    // ---------------------------------------------------------------------------
    // Open a fresh unauthenticated browser context for user 2
    const freshUser2Context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page2 = await freshUser2Context.newPage();

    // 1. Visit viewerShareUrl
    await page2.goto(viewerShareUrl);
    // 2. Verify redirect to /login
    await expect(page2).toHaveURL(/\/login/, { timeout: 15_000 });

    // 3–5. Register and Login User 2
    await page2.getByRole("link", { name: /create account/i }).click();
    await expect(page2).toHaveURL(/\/register/, { timeout: 10_000 });

    try {
      await registerUser(page2, registerUserData2);
    } catch {
      // Ignore if user 2 already registered
    }
    await loginUser(page2, loginUserData2);

    // 6. Open viewerShareUrl again after authenticating
    await page2.goto(viewerShareUrl);

    // 7. Verify the document is accessible
    await waitForEditorReady(page2);

    // ---------------------------------------------------------------------------
    // Flow 5C — Verify Viewer Authorization (Read-Only)
    // ---------------------------------------------------------------------------
    const user2Editor = page2.getByTestId("editor-content").locator(".ProseMirror");
    await expect(user2Editor).toBeVisible({ timeout: 15_000 });

    // TipTap sets contenteditable="false" when read-only (editable is false)
    await expect(user2Editor).toHaveAttribute("contenteditable", "false");

    // The Menubar components should not be rendered for a viewer
    const menubar = page2.getByTestId("menubar"); // Check by locator/selector or tag if Menubar is omitted
    await expect(page2.locator("button[aria-label='Bold']")).not.toBeVisible();

    // ---------------------------------------------------------------------------
    // Flow 5D — Real-Time Viewer Synchronization
    // ---------------------------------------------------------------------------
    // User 1 enters " World" (Expected content: "Hello World")
    await user1Editor.click();
    // Press End to ensure writing at the end of the text
    await page1.keyboard.press("End");
    await page1.keyboard.type(" World");

    // Verify User 2 receives "Hello World" in real time without refreshing
    await waitForEditorContent(page2, "Hello World");

    // ---------------------------------------------------------------------------
    // Flow 6 — Editor Share Link
    // ---------------------------------------------------------------------------
    const editorShareUrl = await getShareLink(page1, "EDITOR");
    expect(editorShareUrl).toContain("/documents/");

    // ---------------------------------------------------------------------------
    // Flow 6A — User 3 Authentication (Unauthenticated -> Redirect)
    // ---------------------------------------------------------------------------
    // Open a fresh unauthenticated browser context for user 3
    const freshUser3Context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page3 = await freshUser3Context.newPage();

    // 1. Visit editorShareUrl
    await page3.goto(editorShareUrl);
    // 2. Verify redirect to /login
    await expect(page3).toHaveURL(/\/login/, { timeout: 15_000 });

    // 3–5. Register and Login User 3
    await page3.getByRole("link", { name: /create account/i }).click();
    await expect(page3).toHaveURL(/\/register/, { timeout: 10_000 });

    try {
      await registerUser(page3, registerUserData3);
    } catch {
      // Ignore if user 3 already registered
    }
    await loginUser(page3, loginUserData3);

    // 6. Open editorShareUrl again after authenticating
    await page3.goto(editorShareUrl);

    // 7. Verify document is accessible
    await waitForEditorReady(page3);

    // ---------------------------------------------------------------------------
    // Flow 6B — Verify Editor Authorization
    // ---------------------------------------------------------------------------
    const user3Editor = page3.getByTestId("editor-content").locator(".ProseMirror");
    await expect(user3Editor).toBeVisible({ timeout: 15_000 });

    // TipTap sets contenteditable="true" when editable
    await expect(user3Editor).toHaveAttribute("contenteditable", "true");

    // ---------------------------------------------------------------------------
    // Flow 6C — Real-Time Editor Collaboration
    // ---------------------------------------------------------------------------
    // User 3 enters " And Welcome"
    // Wait for the synced content to appear before typing
    await expect(user3Editor).toContainText("Hello World", { timeout: 15_000 });
    // Click directly on the paragraph with existing text to place cursor inside it
    const targetParagraph = user3Editor.locator("p").filter({ hasText: "Hello World" });
    await targetParagraph.click();
    await page3.keyboard.press("End");
    await page3.keyboard.type(" And Welcome");

    // Verify User 1 receives "Hello World And Welcome" in real time
    await waitForEditorContent(page1, "Hello World And Welcome");

    // Cleanup fresh contexts
    await freshUser2Context.close();
    await freshUser3Context.close();
  });
});
