import type { Editor as TiptapEditor } from "@tiptap/core";

export type MenubarProps = {
  editor: TiptapEditor;
};

export type DocumentsEditorHeaderProps = {
  documentId: string;
  documentToken: string;
};

import { DocumentShareRole } from "@/features/docs/types/docs";
import { Dispatch, SetStateAction } from "react";

export type ShareModalProps = {
  documentToken: string;
  documentId: string;
  setShareOpen: Dispatch<SetStateAction<boolean>>;
};

export type BinaryValue =
  | Uint8Array
  | ArrayBuffer
  | number[]
  | {
      type: "Buffer";
      data: number[];
    };

export type ShareableRole = Exclude<DocumentShareRole, "OWNER">;

export type OnlineStatus = "online" | "offline";

export type CollaboratorRole = "OWNER" | "EDITOR" | "VIEWER";

export interface CollaboratorUser {
  id: string;
  email: string;
  fullName: string;
}

export interface DocumentCollaborator {
  id: string | null;
  documentId: string;
  userId: string;
  invitedBy: string | null;
  isCreator: boolean;
  joinedAt: string | null;
  onlineStatus: OnlineStatus;
  role: CollaboratorRole;
  user: CollaboratorUser;
}

export interface CollaboratorsResponse {
  success: boolean;
  data: DocumentCollaborator[];
}

export type DocumentUpdate = ArrayBuffer | Uint8Array | number[] | string;

export type EditorProps = {
  userToken: string | undefined;
  documentId: string;
  documentToken: string;
};
