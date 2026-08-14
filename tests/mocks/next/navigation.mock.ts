import { jest } from "@jest/globals";

export const mockRedirect =
  jest.fn(
    (path: string): never => {
      throw new Error(
        `REDIRECT:${path}`,
      );
    },
  );

export function createNavigationMock() {
  return {
    redirect: mockRedirect,
  };
}