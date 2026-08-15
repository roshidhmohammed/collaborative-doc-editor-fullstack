import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

(process.env as any).NODE_ENV = "testing";
process.env.SESSION_SECRET =
  "integration-test-session-secret-with-sufficient-length";

jest.setTimeout(30000);