import "@testing-library/jest-dom";

(process.env as any).NODE_ENV = "testing";
process.env.SESSION_SECRET =
  "integration-test-session-secret-with-sufficient-length";