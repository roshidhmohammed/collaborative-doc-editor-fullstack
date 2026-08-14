export const documentAccessFixtures = {
  editor: {
    role: "EDITOR" as const,
  },

  viewer: {
    role: "VIEWER" as const,
  },

  owner: {
    role: "OWNER" as const,
  },
} as const;