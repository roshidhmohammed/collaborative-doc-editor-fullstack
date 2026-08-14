export const documentFixtures = {
  ownerDocument: {
    title: "Owner Document",
  },

  collaboratorDocument: {
    title: "Collaborator Document",
  },

  inaccessibleDocument: {
    title: "Private Document",
  },

  expiredShareDocument: {
    title: "Expired Share Document",
  },

  inactiveShareDocument: {
    title: "Inactive Share Document",
  },
};

export const collaboratorRoles = {
  editor: "EDITOR",
  viewer: "VIEWER",
} as const;