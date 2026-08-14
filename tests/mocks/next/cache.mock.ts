import { jest } from "@jest/globals";

export const mockRevalidatePath = jest.fn();

export const mockNextCacheModule = {
  revalidatePath: mockRevalidatePath,
};