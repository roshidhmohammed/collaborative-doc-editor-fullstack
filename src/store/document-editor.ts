import { DocumentEditorState } from "@/shared/types/doc-editor-store";
import { DocumentCollaborator } from "@/features/docEditor/types/docEditor";
import { create } from "zustand";

const initialState = {
  shareOpen: false,
  collaborators: [] as DocumentCollaborator[],
};

export const useDocumentEditorStore = create<DocumentEditorState>((set) => ({
  ...initialState,

  openShareModal: () => set({ shareOpen: true }),
  closeShareModal: () => set({ shareOpen: false }),

  setCollaborators: (collaborators) =>
    set({
      collaborators,
    }),

  removeCollaborator: () => set(() => ({ collaborators: [] })),

  reset: () => set(initialState),
}));
