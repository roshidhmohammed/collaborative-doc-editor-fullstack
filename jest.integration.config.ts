import nextJest from "next/jest";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  displayName: "integration",

  testEnvironment: "node",

  setupFilesAfterEnv: [
    "<rootDir>/tests/integration/setup/setup.integration.ts",
  ],

moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
  "^@tests/(.*)$": "<rootDir>/tests/$1",
},

  testMatch: [
    "<rootDir>/tests/integration/**/*.integration.test.ts",
  ],

  clearMocks: true,
  restoreMocks: true,

  maxWorkers: 1,

  extensionsToTreatAsEsm: [".ts", ".tsx"],
};

export default createJestConfig(customJestConfig);