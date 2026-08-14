import { jest } from "@jest/globals";

export const mockVerifySession = jest.fn();

export const mockAuthModule = {
  verifySession: mockVerifySession,
};