import { FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load env variables from .env.testing (same source as playwright.config.ts)
dotenv.config({
  path: path.resolve(process.cwd(), ".env.testing"),
});

async function globalTeardown(config: FullConfig) {
  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!NEXT_PUBLIC_API_URL) {
    console.error("[Global Teardown] NEXT_PUBLIC_API_URL is not defined. Skipping database cleanup.");
    return;
  }

  const url = `${NEXT_PUBLIC_API_URL}/db/cleanup`;

  console.log(`\n[Global Teardown] Cleaning up database by calling: ${url}`);

  try {
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log(`[Global Teardown] Database cleaned up successfully (Status: ${response.status}).`);
    } else {
      console.error(
        `[Global Teardown] Failed to clean up database. Status: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`[Global Teardown] Error calling database cleanup API:`, error);
  }
}

export default globalTeardown;
