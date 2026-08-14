"use client";

import { useQuery } from "@tanstack/react-query";

import { getDocumentDetails } from "../services/doc-editor";
import type {
  DocumentDetails,
  DocumentShareLink,
  GetDocumentResponse,
  UseFetchDocumentDetailsOptions,
} from "../types/document";

const DOCUMENT_DETAILS_STALE_TIME = 5 * 60 * 1000;
const DOCUMENT_DETAILS_GC_TIME = 30 * 60 * 1000;

export const documentDetailsQueryKey = (documentToken: string) =>
  ["document", "details", documentToken] as const;

export const selectDocument = (
  response: GetDocumentResponse,
): DocumentDetails => response.document;

export const selectDocumentName = (response: GetDocumentResponse) =>
  selectDocument(response).name;

export const selectDocumentContent = (response: GetDocumentResponse) =>
  selectDocument(response).content;

export const selectDocumentShareLinks = (
  response: GetDocumentResponse,
): DocumentShareLink[] => response.documentShareLinks;

export const selectCurrentDocumentShareLink = (
  response: GetDocumentResponse,
): DocumentShareLink => response.currentDocumentShareLink;

export const selectCurrentDocumentRole = (response: GetDocumentResponse) =>
  response.currentDocumentShareLink.role;

export const selectCanEditDocument = (response: GetDocumentResponse) => {
  const role = response.currentDocumentShareLink.role;

  return role === "OWNER" || role === "EDITOR";
};

/** Fetches and caches document and share details by token. */
export function useFetchDocumentDetails<TData = GetDocumentResponse>(
  documentToken: string,
  options: UseFetchDocumentDetailsOptions<TData> = {},
) {
  return useQuery<GetDocumentResponse, Error, TData>({
    queryKey: documentDetailsQueryKey(documentToken),
    queryFn: () => getDocumentDetails(documentToken),
    enabled: Boolean(documentToken),
    staleTime: DOCUMENT_DETAILS_STALE_TIME,
    gcTime: DOCUMENT_DETAILS_GC_TIME,
    select: options.select,
  });
}
