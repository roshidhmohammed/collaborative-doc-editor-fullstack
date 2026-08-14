export interface Document {
  _id?: string;
  id?: string;
  associatedRoleToken?: string;
  name: string;
  content?: string;
  score?: number;
  collaborators?: number | unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentCardProps = {
  document: Document;
};

export type DocumentShareRole = "OWNER" | "EDITOR" | "VIEWER";

export type DocumentPageProps = {
  params: Promise<{
    id: string;
    documentToken: string;
  }>;
};