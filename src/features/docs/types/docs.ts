import type { getAllDocuments } from "../services/get-all-documents";

export type GetAllDocumentsItem = Awaited<ReturnType<typeof getAllDocuments>>[number];

export interface Document {
  _id?: string;
  id?: string;
  associatedRoleToken?: string | null;
  name: string;
  content?: Uint8Array | string | null;
  score?: number;
  collaborators?: number | unknown[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

export type DocumentCardProps = {
  document: Document | GetAllDocumentsItem;
};

export type DocumentShareRole = "OWNER" | "EDITOR" | "VIEWER";

export type DocumentPageProps = {
  params: Promise<{
    id: string;
    documentToken: string;
  }>;
};