import { Browser, BrowserContext, Page, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// createUserBrowserContext
// Creates a fully isolated browser context for a user.
// Each context gets its own cookies / session / IndexedDB / clipboard.
// ---------------------------------------------------------------------------
export async function createUserBrowserContext(
  browser: Browser,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    // Grant clipboard permissions so we can read copied share links
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  return { context, page };
}

// ---------------------------------------------------------------------------
// getShareLink
// Opens the Share dialog, selects the desired role, clicks Copy Link, and
// reads the URL from the clipboard.
//
// Precondition: the caller's page must be on the editor page and the
//               Share button must be visible (i.e. the user must be OWNER).
// ---------------------------------------------------------------------------
export async function getShareLink(
  page: Page,
  role: "VIEWER" | "EDITOR",
): Promise<string> {
  // Open the share modal
  await page.getByTestId("share-link-button").click();

  // Select the desired role in the <select>
  await page.getByTestId("share-access-level").selectOption(role);

  // Wait for the copy button to become enabled (share link loaded)
  const copyBtn = page.getByTestId("copy-share-link");
  await expect(copyBtn).toBeEnabled({ timeout: 15_000 });

  // Click copy — this writes the share URL to the clipboard
  await copyBtn.click();

  // Wait for the button to say "Copied!" confirming the clipboard write
  await expect(copyBtn).toContainText("Copied", { timeout: 10_000 });

  // Read the URL from the clipboard
  const shareUrl = await page.evaluate(async () => {
    return navigator.clipboard.readText();
  });

  if (!shareUrl) {
    throw new Error(`Share URL for role ${role} was empty after copying`);
  }

  // Close the modal by clicking the close button
  const closeBtn = page.locator("button[aria-label='Close modal']");
  await closeBtn.click();

  // Wait for the modal/dialog to be removed from view
  await expect(page.getByRole("dialog")).not.toBeVisible();

  return shareUrl;
}

// ---------------------------------------------------------------------------
// waitForCollaboratorStatus
// Polls until the collaborator status element for a specific email shows the
// expected status text ("online" or "offline").
// ---------------------------------------------------------------------------
export async function waitForCollaboratorStatus(
  page: Page,
  email: string,
  status: "online" | "offline",
): Promise<void> {
  const locator = page.getByTestId(`collaborator-status-${email}`);
  await expect(locator).toHaveText(status, { timeout: 30_000 });
}

// ---------------------------------------------------------------------------
// waitForEditorContent
// Waits until the editor's ProseMirror div contains the expected text.
// This verifies real-time Socket.IO/Yjs propagation without page refresh.
// ---------------------------------------------------------------------------
export async function waitForEditorContent(
  page: Page,
  expectedText: string,
): Promise<void> {
  // TipTap renders its content inside .ProseMirror within [data-testid="editor-content"]
  const editorContent = page.getByTestId("editor-content").locator(".ProseMirror");
  await expect(editorContent).toContainText(expectedText, { timeout: 30_000 });
}
