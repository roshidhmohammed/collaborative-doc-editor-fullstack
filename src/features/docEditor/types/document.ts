export type DocumentShareRole = "OWNER" | "EDITOR" | "VIEWER";

export type DocumentDetails = {
  id: string;
  name: string;
  content: string | null;
  creatorLink?: string | null;
};

export type DocumentShareLink = {
  id: string;
  token: string;
  documentId: string;
  role: DocumentShareRole;
  createdById: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type GetDocumentResponse = {
  document: DocumentDetails;
  documentShareLinks: DocumentShareLink[];
  currentDocumentShareLink: DocumentShareLink;
};

export type UseFetchDocumentDetailsOptions<TData = GetDocumentResponse> = {
  select?: (response: GetDocumentResponse) => TData;
  enabled?: boolean;
};
