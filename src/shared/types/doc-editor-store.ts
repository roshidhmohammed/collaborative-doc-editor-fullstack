import { DocumentCollaborator } from "@/features/docEditor";


export type DocumentEditorState = {
  shareOpen: boolean;
  collaborators: DocumentCollaborator[];

  openShareModal: () => void;
  closeShareModal: () => void;

  setCollaborators: (collaborators: DocumentCollaborator[]) => void;
  removeCollaborator: () => void;

  reset: () => void;
};