export type RegisterState = {
  success?: boolean;
  message: string;
  errors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  } | undefined;
};

export type loginState = {
  success?: boolean;
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
  } | undefined;
};

export type CollaboratorState = {
  fullName: string;
  email: string;
};



export type createDocumentState = {
  success?: boolean;
  message: string;
  errors?: {
    title?: string[];
  } | string;

  docDetails?: {
    document: {
      id: string;
      name: string;
      content: Uint8Array | null;
      creatorId: string;
      creatorLink: string | null;

      creator: {
        id: string;
        email: string;
        fullName: string | null;
      };

      collaborators?: CollaboratorState[];

      createdAt: Date;
      updatedAt: Date;
    };

    ownerToken: string;
  };
};