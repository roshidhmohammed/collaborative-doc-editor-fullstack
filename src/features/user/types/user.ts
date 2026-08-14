export type UserDataType = {
  id: string;
  fullName: string | null;
  email: string;
};

export type ProfileModalProps = {
  userData?: UserDataType | null | undefined;
};
