export const collaboratorAssignmentFixtures = {
  editor: {
    role: "EDITOR" as const,
  },

  viewer: {
    role: "VIEWER" as const,
  },

  invalidRole: {
    role: "OWNER" as const,
  },
};