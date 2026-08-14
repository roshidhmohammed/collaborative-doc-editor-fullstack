export function createMockCookieStore() {
  const cookies = new Map<string, string>();

  return {
    get: jest.fn((name: string) => {
      const value = cookies.get(name);

      return value
        ? {
            name,
            value,
          }
        : undefined;
    }),

    set: jest.fn(
      (
        name: string,
        value: string,
        options?: Record<string, unknown>,
      ) => {
        cookies.set(name, value);

        return {
          name,
          value,
          options,
        };
      },
    ),

    delete: jest.fn((name: string) => {
      cookies.delete(name);
    }),

    has: jest.fn((name: string) => cookies.has(name)),

    getAll: jest.fn(() =>
      Array.from(cookies.entries()).map(([name, value]) => ({
        name,
        value,
      })),
    ),

    clear: () => {
      cookies.clear();
    },

    getValue: (name: string) => cookies.get(name),
  };
}