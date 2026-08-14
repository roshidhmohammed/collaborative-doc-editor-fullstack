import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  roots: ["<rootDir>/tests/unit"],

  setupFilesAfterEnv: [
    "<rootDir>/tests/setup/unit.setup.ts",
  ],

moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
  "^@tests/(.*)$": "<rootDir>/tests/$1",
},

  clearMocks: true,
  restoreMocks: true,
};

export default config;