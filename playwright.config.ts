import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.testing"),
});

// All env variables are loaded from .env.testing via dotenv above.
// Fail fast if any required variable is missing.
const required = [
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_SOCKET_URL",
  "NODE_ENV",
  "NEXT_PUBLIC_APP_ENV",
  "DATABASE_URL",
  "SESSION_SECRET",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}. Check .env.testing.`);
  }
}

const PORT = process.env.PORT ?? "3000";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;
const NODE_ENV = process.env.NODE_ENV!;
const NEXT_PUBLIC_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV!;
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL!;
const NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;
const API_URL = NEXT_PUBLIC_API_URL;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  globalTeardown: require.resolve("./e2e/global-teardown"),

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: process.env.CI
    ? [
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["github"],
      ]
    : [
        ["html", { open: "on-failure" }],
        ["list"],
      ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  timeout: 90_000,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: BASE_URL,
    // Reuse a local server when not in CI so leftover :3000 processes don't fail the suite.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT,
      NODE_ENV,
      NEXT_PUBLIC_APP_ENV,
      NEXT_PUBLIC_BASE_URL: BASE_URL,
      NEXT_PUBLIC_SOCKET_URL,
      API_URL,
      DATABASE_URL: process.env.DATABASE_URL!,
      SESSION_SECRET: process.env.SESSION_SECRET!,
    },
  },

  outputDir: "test-results",

  expect: {
    timeout: 20_000,
  },
});
