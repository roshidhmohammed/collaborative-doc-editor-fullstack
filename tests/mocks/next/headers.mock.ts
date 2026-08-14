import { jest } from "@jest/globals";

export interface MockCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  expires?: Date;
  maxAge?: number;
}

export interface MockCookieStore {
  get: jest.Mock<any>;
  set: jest.Mock<any>;
  delete: jest.Mock<any>;

  clear(): void;

  getValue(
    name: string,
  ): string | undefined;

  has(name: string): boolean;
}

export function createCookieStore(): MockCookieStore {
  const cookies =
    new Map<
      string,
      {
        name: string;
        value: string;
        options?: MockCookieOptions;
      }
    >();

  const store: MockCookieStore = {
    get: jest.fn(
      (name: string) => {
        const cookie =
          cookies.get(name);

        if (!cookie) {
          return undefined;
        }

        return {
          name: cookie.name,
          value: cookie.value,
        };
      },
    ),

    set: jest.fn(
      (
        name: string,
        value: string,
        options?: MockCookieOptions,
      ) => {
        cookies.set(name, {
          name,
          value,
          options,
        });
      },
    ),

    delete: jest.fn(
      (name: string) => {
        cookies.delete(name);
      },
    ),

    clear() {
      cookies.clear();
    },

    getValue(name: string) {
      return cookies.get(name)?.value;
    },

    has(name: string) {
      return cookies.has(name);
    },
  };

  return store;
}