import { test as base, expect, Browser, BrowserContext, Page } from "@playwright/test";
import { createUserBrowserContext } from "../utils/collaboration";
import { registerUser, loginUser } from "../utils/auth";
import {
  loginUserData1,
  loginUserData2,
  loginUserData3,
  registerUserData1,
  registerUserData2,
  registerUserData3,
} from "../data/test-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type UserContext = {
  context: BrowserContext;
  page: Page;
};

type CollaborationFixtures = {
  /** Isolated browser context + page authenticated as User 1. */
  user1Ctx: UserContext;
  /** Isolated browser context + page authenticated as User 2. */
  user2Ctx: UserContext;
  /** Isolated browser context + page authenticated as User 3. */
  user3Ctx: UserContext;
};

// ---------------------------------------------------------------------------
// Helper: ensure a user is authenticated in a fresh context
// ---------------------------------------------------------------------------
async function authenticateInContext(
  browser: Browser,
  registerData: typeof registerUserData1,
  loginData: typeof loginUserData1,
): Promise<UserContext> {
  const { context, page } = await createUserBrowserContext(browser);

  try {
    await loginUser(page, loginData);
  } catch {
    try {
      await registerUser(page, registerData);
    } catch {
      // Already registered — fine.
    }
    await loginUser(page, loginData);
  }

  return { context, page };
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------
export const test = base.extend<CollaborationFixtures>({
  user1Ctx: async ({ browser }, use) => {
    const ctx = await authenticateInContext(browser, registerUserData1, loginUserData1);
    await use(ctx);
    await ctx.context.close();
  },

  user2Ctx: async ({ browser }, use) => {
    const ctx = await authenticateInContext(browser, registerUserData2, loginUserData2);
    await use(ctx);
    await ctx.context.close();
  },

  user3Ctx: async ({ browser }, use) => {
    const ctx = await authenticateInContext(browser, registerUserData3, loginUserData3);
    await use(ctx);
    await ctx.context.close();
  },
});

export { expect };
