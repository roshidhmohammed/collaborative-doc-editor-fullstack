import { test, expect } from "../fixtures/collaboration.fixture";
import { getShareLink, waitForCollaboratorStatus } from "../utils/collaboration";
import { createDocument, openDocument, waitForEditorReady } from "../utils/documents";
import { registerUserData1, registerUserData2, registerUserData3, docDetails1 } from "../data/test-data";

test.describe("Collaborator Presence and Online/Offline Status", () => {
  test("Verify online and offline collaborator status updates in real time", async ({
    user1Ctx,
    user2Ctx,
    user3Ctx,
  }) => {
    const page1 = user1Ctx.page;
    const page2 = user2Ctx.page;
    const page3 = user3Ctx.page;

    // ---------------------------------------------------------------------------
    // Step 1: User 1 creates/opens the document
    // ---------------------------------------------------------------------------
    let editorUrl: string;
    try {
      editorUrl = await createDocument(page1, docDetails1.title);
    } catch {
      await openDocument(page1, docDetails1.title);
      editorUrl = page1.url();
    }
    await waitForEditorReady(page1);

    // ---------------------------------------------------------------------------
    // Step 2: User 1 generates an Editor share link
    // ---------------------------------------------------------------------------
    const editorShareUrl = await getShareLink(page1, "EDITOR");

    // ---------------------------------------------------------------------------
    // Step 3: User 2 and User 3 join the document using the share link
    // ---------------------------------------------------------------------------
    await page2.goto(editorShareUrl);
    await waitForEditorReady(page2);

    await page3.goto(editorShareUrl);
    await waitForEditorReady(page3);

    // ---------------------------------------------------------------------------
    // Flow 7 — Collaborator List (All three are online)
    // ---------------------------------------------------------------------------
    // From User 1's page, verify collaborator list shows all three users as "online"
    await expect(page1.getByTestId("collaborator-list")).toBeVisible({ timeout: 15_000 });

    await waitForCollaboratorStatus(page1, registerUserData1.email, "online");
    await waitForCollaboratorStatus(page1, registerUserData2.email, "online");
    await waitForCollaboratorStatus(page1, registerUserData3.email, "online");

    // ---------------------------------------------------------------------------
    // Flow 7A — User 2 Goes Offline
    // ---------------------------------------------------------------------------
    // Click the logo link to return to the document list via client-side routing.
    // This allows the cleanup hooks to execute and notify the socket server.
    await page2.getByRole("link", { name: "Collab Doc Creator" }).click();

    // Ensure User 2 has fully left the document workspace page
    await expect(page2).toHaveURL(/\/documents$/, { timeout: 15_000 });

    // Verify on User 1's page that User 2 eventually appears "offline"
    await waitForCollaboratorStatus(page1, registerUserData2.email, "offline");

    // Other users (User 1 and User 3) should still remain "online"
    await expect(page1.getByTestId(`collaborator-status-${registerUserData1.email}`)).toHaveText("online");
    await expect(page1.getByTestId(`collaborator-status-${registerUserData3.email}`)).toHaveText("online");
  });
});
