import React from "react";
import {
  renderHook,
  waitFor,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  documentDetailsQueryKey,
  selectDocument,
  selectDocumentName,
  selectDocumentContent,
  selectDocumentShareLinks,
  selectCurrentDocumentShareLink,
  selectCurrentDocumentRole,
  selectCanEditDocument,
  useFetchDocumentDetails,
} from "@/features/docEditor/hooks/useFetchDocumentDetails";

import { getDocumentDetails } from "@/features/docEditor/services/doc-editor";

import type {
  GetDocumentResponse,
} from "@/features/docEditor/types/document";

jest.mock(
  "@/features/docEditor/services/doc-editor",
  () => ({
    getDocumentDetails: jest.fn(),
  }),
);

describe("useFetchDocumentDetails", () => {
  const mockGetDocumentDetails =
    getDocumentDetails as jest.MockedFunction<
      typeof getDocumentDetails
    >;

  const mockResponse: GetDocumentResponse = {
    document: {
      id: "document-123",
      name: "Collaborative Document",
      content: "Document content",
    },

    documentShareLinks: [
      {
        documentId: "document-123",
        token: "viewer-token",
        role: "VIEWER",
        isActive: true,
      },
      {
        documentId: "document-123",
        token: "editor-token",
        role: "EDITOR",
        isActive: true,
      },
    ],

    currentDocumentShareLink: {
      documentId: "document-123",
      token: "editor-token",
      role: "EDITOR",
      isActive: true,
    },
  } as GetDocumentResponse;

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return function Wrapper({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Query key
  // ---------------------------------------------------------------------------

  describe("documentDetailsQueryKey", () => {
    it("creates the correct query key", () => {
      expect(
        documentDetailsQueryKey("document-token"),
      ).toEqual([
        "document",
        "details",
        "document-token",
      ]);
    });

    it("creates different keys for different tokens", () => {
      const firstKey =
        documentDetailsQueryKey("token-1");

      const secondKey =
        documentDetailsQueryKey("token-2");

      expect(firstKey).not.toEqual(secondKey);
    });

    it("returns a readonly tuple", () => {
      const key =
        documentDetailsQueryKey("token-123");

      expect(key).toHaveLength(3);
      expect(key[0]).toBe("document");
      expect(key[1]).toBe("details");
      expect(key[2]).toBe("token-123");
    });
  });

  // ---------------------------------------------------------------------------
  // Selectors
  // ---------------------------------------------------------------------------

  describe("selectDocument", () => {
    it("returns the document from the API response", () => {
      expect(
        selectDocument(mockResponse),
      ).toEqual(mockResponse.document);
    });
  });

  describe("selectDocumentName", () => {
    it("returns the document name", () => {
      expect(
        selectDocumentName(mockResponse),
      ).toBe("Collaborative Document");
    });
  });

  describe("selectDocumentContent", () => {
    it("returns the document content", () => {
      expect(
        selectDocumentContent(mockResponse),
      ).toBe("Document content");
    });
  });

  describe("selectDocumentShareLinks", () => {
    it("returns all document share links", () => {
      expect(
        selectDocumentShareLinks(mockResponse),
      ).toEqual(
        mockResponse.documentShareLinks,
      );
    });

    it("returns an empty array when there are no share links", () => {
      const response = {
        ...mockResponse,
        documentShareLinks: [],
      } as GetDocumentResponse;

      expect(
        selectDocumentShareLinks(response),
      ).toEqual([]);
    });
  });

  describe("selectCurrentDocumentShareLink", () => {
    it("returns the current document share link", () => {
      expect(
        selectCurrentDocumentShareLink(mockResponse),
      ).toEqual(
        mockResponse.currentDocumentShareLink,
      );
    });
  });

  describe("selectCurrentDocumentRole", () => {
    it("returns the current user's document role", () => {
      expect(
        selectCurrentDocumentRole(mockResponse),
      ).toBe("EDITOR");
    });

    it.each([
      ["OWNER", "OWNER"],
      ["EDITOR", "EDITOR"],
      ["VIEWER", "VIEWER"],
    ])(
      "returns %s when the current share link role is %s",
      (role) => {
        const response = {
          ...mockResponse,
          currentDocumentShareLink: {
            ...mockResponse.currentDocumentShareLink,
            role,
          },
        } as GetDocumentResponse;

        expect(
          selectCurrentDocumentRole(response),
        ).toBe(role);
      },
    );
  });

  describe("selectCanEditDocument", () => {
    it("returns true for OWNER", () => {
      const response = {
        ...mockResponse,
        currentDocumentShareLink: {
          ...mockResponse.currentDocumentShareLink,
          role: "OWNER",
        },
      } as GetDocumentResponse;

      expect(
        selectCanEditDocument(response),
      ).toBe(true);
    });

    it("returns true for EDITOR", () => {
      const response = {
        ...mockResponse,
        currentDocumentShareLink: {
          ...mockResponse.currentDocumentShareLink,
          role: "EDITOR",
        },
      } as GetDocumentResponse;

      expect(
        selectCanEditDocument(response),
      ).toBe(true);
    });

    it("returns false for VIEWER", () => {
      const response = {
        ...mockResponse,
        currentDocumentShareLink: {
          ...mockResponse.currentDocumentShareLink,
          role: "VIEWER",
        },
      } as GetDocumentResponse;

      expect(
        selectCanEditDocument(response),
      ).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Hook
  // ---------------------------------------------------------------------------

  describe("useFetchDocumentDetails", () => {
    it("fetches document details using the supplied token", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(
        mockGetDocumentDetails,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockGetDocumentDetails,
      ).toHaveBeenCalledWith(
        "document-token",
      );

      expect(result.current.data).toEqual(
        mockResponse,
      );
    });

    it("starts in a loading state for a valid token", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
          ),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("returns an error when fetching fails", async () => {
      const error = new Error(
        "Failed to fetch document",
      );

      mockGetDocumentDetails.mockRejectedValue(
        error,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);

      expect(
        mockGetDocumentDetails,
      ).toHaveBeenCalledWith(
        "document-token",
      );
    });

    it("does not fetch when document token is empty", async () => {
      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(""),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.fetchStatus).toBe(
        "idle",
      );

      expect(
        mockGetDocumentDetails,
      ).not.toHaveBeenCalled();
    });

    it("does not fetch when document token is missing", async () => {
      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            undefined as unknown as string,
          ),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.fetchStatus).toBe(
        "idle",
      );

      expect(
        mockGetDocumentDetails,
      ).not.toHaveBeenCalled();
    });

    it("uses the document details query key", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });

      const wrapper = ({
        children,
      }: {
        children: React.ReactNode;
      }) => (
        <QueryClientProvider
          client={queryClient}
        >
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
          ),
        {
          wrapper,
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedData =
        queryClient.getQueryData(
          documentDetailsQueryKey(
            "document-token",
          ),
        );

      expect(cachedData).toEqual(
        mockResponse,
      );
    });

    it("supports selecting only the document name", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
            {
              select: selectDocumentName,
            },
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(
        "Collaborative Document",
      );
    });

    it("supports selecting only the document content", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
            {
              select: selectDocumentContent,
            },
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(
        "Document content",
      );
    });

    it("supports selecting document share links", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
            {
              select:
                selectDocumentShareLinks,
            },
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(
        mockResponse.documentShareLinks,
      );
    });

    it("supports selecting the current document share link", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
            {
              select:
                selectCurrentDocumentShareLink,
            },
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(
        mockResponse.currentDocumentShareLink,
      );
    });

    it("supports selecting the current user's role", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
            {
              select:
                selectCurrentDocumentRole,
            },
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(
        "EDITOR",
      );
    });

    it("supports selecting whether the current user can edit", async () => {
      mockGetDocumentDetails.mockResolvedValue(
        mockResponse,
      );

      const { result } = renderHook(
        () =>
          useFetchDocumentDetails(
            "document-token",
            {
              select:
                selectCanEditDocument,
            },
          ),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe(true);
    });
  });
});