import type { getDocumentDetails } from "../services/doc-editor";

export type DocumentShareRole = "OWNER" | "EDITOR" | "VIEWER";

export type GetDocumentResponse = Awaited<ReturnType<typeof getDocumentDetails>>;

export type DocumentDetails = GetDocumentResponse["document"];

export type DocumentShareLink = GetDocumentResponse["currentDocumentShareLink"];

export type UseFetchDocumentDetailsOptions<TData = GetDocumentResponse> = {
  select?: (response: GetDocumentResponse) => TData;
  enabled?: boolean;
};
