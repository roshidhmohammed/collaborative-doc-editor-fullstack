import { fireEvent, render, screen } from "@testing-library/react";

import DocumentsEditorHeader from "@/features/docEditor/components/DocumentsEditorHeader";

import { useDocumentEditorStore } from "@/store/document-editor";
import { useFetchDocumentDetails } from "@/features/docEditor/hooks/useFetchDocumentDetails";

import { notFound } from "next/navigation";

jest.mock("@/store/document-editor", () => ({
  useDocumentEditorStore: jest.fn(),
}));

jest.mock("@/features/docEditor/hooks/useFetchDocumentDetails", () => ({
  useFetchDocumentDetails: jest.fn(),
  selectDocumentName: jest.fn(),
  selectCurrentDocumentShareLink: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/features/docEditor/components/ShareModal", () => ({
  __esModule: true,
  default: ({
    documentId,
    documentToken,
    setShareOpen,
  }: {
    documentId: string;
    documentToken: string;
    setShareOpen: (value: boolean) => void;
  }) => (
    <div data-testid="share-modal">
      <span>{documentId}</span>
      <span>{documentToken}</span>

      <button type="button" onClick={() => setShareOpen(false)}>
        Close share modal
      </button>
    </div>
  ),
}));

describe("DocumentsEditorHeader", () => {
  const mockUseDocumentEditorStore = useDocumentEditorStore as jest.Mock;

  const mockUseFetchDocumentDetails = useFetchDocumentDetails as jest.Mock;

  const mockNotFound = notFound as jest.Mock;

  const mockOpenShareModal = jest.fn();
  const mockCloseShareModal = jest.fn();

  /**
   * State returned by the two useFetchDocumentDetails calls.
   *
   * First call  -> document name
   * Second call -> current user's document details
   */
  let documentNameResult: {
    data: string | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  let currentUserDetailsResult: {
    data: any;
    isLoading: boolean;
    isError: boolean;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    documentNameResult = {
      data: "My Document",
      isLoading: false,
      isError: false,
    };

    currentUserDetailsResult = {
      data: {
        role: "OWNER",
      },
      isLoading: false,
      isError: false,
    };

    mockUseDocumentEditorStore.mockReturnValue({
      shareOpen: false,
      openShareModal: mockOpenShareModal,
      closeShareModal: mockCloseShareModal,
    });

    /**
     * IMPORTANT:
     *
     * Do not use mockReturnValueOnce().
     *
     * Always return a result for the first and second
     * hook invocation.
     */
    mockUseFetchDocumentDetails.mockImplementation(
      (_documentToken: string, options: any) => {
        /**
         * The component makes exactly two calls:
         *
         * 1. { select: selectDocumentName }
         * 2. { select: selectCurrentDocumentShareLink }
         *
         * We determine which one this is based on
         * the position of the call in the current render.
         */
        const calls = mockUseFetchDocumentDetails.mock.calls;

        const currentCallIndex = calls.length - 1;

        if (currentCallIndex % 2 === 0) {
          return documentNameResult;
        }

        return currentUserDetailsResult;
      },
    );
  });

  /* ====================================================================== */
  /* Rendering                                                              */
  /* ====================================================================== */

  describe("Rendering", () => {
    it("renders document workspace", () => {
      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(screen.getByText("Document workspace")).toBeInTheDocument();
    });

    it("renders document name", () => {
      documentNameResult = {
        data: "Project Documentation",
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(screen.getByText("Project Documentation")).toBeInTheDocument();
    });

    it("renders loading document text", () => {
      documentNameResult = {
        data: undefined,
        isLoading: true,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(screen.getByText("Loading document...")).toBeInTheDocument();
    });

    it("renders fallback document name when API name is unavailable", () => {
      documentNameResult = {
        data: undefined,
        isLoading: false,
        isError: false,
      };

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-123" documentToken="token-1" />,
      );

      expect(screen.getByText("Document doc-123")).toBeInTheDocument();
    });
  });

  /* ====================================================================== */
  /* Hook calls                                                             */
  /* ====================================================================== */

  describe("Document details fetching", () => {
    it("calls useFetchDocumentDetails twice", () => {
      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(mockUseFetchDocumentDetails).toHaveBeenCalledTimes(2);
    });

    it("passes document token to both hook calls", () => {
      render(
        <DocumentsEditorHeader
          documentId="doc-1"
          documentToken="my-document-token"
        />,
      );

      expect(mockUseFetchDocumentDetails.mock.calls[0][0]).toBe(
        "my-document-token",
      );

      expect(mockUseFetchDocumentDetails.mock.calls[1][0]).toBe(
        "my-document-token",
      );
    });
  });

  /* ====================================================================== */
  /* Error handling                                                         */
  /* ====================================================================== */

  describe("Error handling", () => {
    it("calls notFound when document request fails and current user details are unavailable", () => {
      documentNameResult = {
        data: undefined,
        isLoading: true, // IMPORTANT
        isError: true,
      };

      currentUserDetailsResult = {
        data: undefined,
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it("does not call notFound when current user details exist", () => {
      documentNameResult = {
        data: undefined,
        isLoading: false,
        isError: true,
      };

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(mockNotFound).not.toHaveBeenCalled();
    });

    it("renders error message when document request fails", () => {
      documentNameResult = {
        data: undefined,
        isLoading: false,
        isError: true,
      };

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(
        screen.getByText("We couldn't load the latest document details."),
      ).toBeInTheDocument();
    });

    it("throws when current user document details are unavailable after loading", () => {
      documentNameResult = {
        data: undefined,
        isLoading: false,
        isError: false,
      };

      currentUserDetailsResult = {
        data: undefined,
        isLoading: false,
        isError: false,
      };

      expect(() => {
        render(
          <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
        );
      }).toThrow("Failed to view this document");
    });
  });

  /* ====================================================================== */
  /* Share link                                                             */
  /* ====================================================================== */

  describe("Share link authorization", () => {
    it("renders Share link for OWNER", () => {
      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(
        screen.getByRole("button", {
          name: /share link/i,
        }),
      ).toBeInTheDocument();
    });

    it("does not render Share link for EDITOR", () => {
      currentUserDetailsResult = {
        data: {
          role: "EDITOR",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(
        screen.queryByRole("button", {
          name: /share link/i,
        }),
      ).not.toBeInTheDocument();
    });

    it("does not render Share link for VIEWER", () => {
      currentUserDetailsResult = {
        data: {
          role: "VIEWER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(
        screen.queryByRole("button", {
          name: /share link/i,
        }),
      ).not.toBeInTheDocument();
    });

    it("renders Share link when current user details are undefined", () => {
      documentNameResult = {
        data: undefined,
        isLoading: true, // IMPORTANT
        isError: false,
      };

      currentUserDetailsResult = {
        data: undefined,
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(
        screen.getByRole("button", {
          name: /share link/i,
        }),
      ).toBeInTheDocument();
    });
  });

  /* ====================================================================== */
  /* Store actions                                                          */
  /* ====================================================================== */

  describe("Store actions", () => {
    it("calls openShareModal when Share link is clicked", () => {
      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: /share link/i,
        }),
      );

      expect(mockOpenShareModal).toHaveBeenCalledTimes(1);
    });

    it("does not call openShareModal for non-owner", () => {
      currentUserDetailsResult = {
        data: {
          role: "EDITOR",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(
        screen.queryByRole("button", {
          name: /share link/i,
        }),
      ).not.toBeInTheDocument();

      expect(mockOpenShareModal).not.toHaveBeenCalled();
    });
  });

  /* ====================================================================== */
  /* Share modal                                                            */
  /* ====================================================================== */

  describe("Share modal", () => {
    it("does not render ShareModal when shareOpen is false", () => {
      mockUseDocumentEditorStore.mockReturnValue({
        shareOpen: false,
        openShareModal: mockOpenShareModal,
        closeShareModal: mockCloseShareModal,
      });

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(screen.queryByTestId("share-modal")).not.toBeInTheDocument();
    });

    it("renders ShareModal when shareOpen is true", () => {
      mockUseDocumentEditorStore.mockReturnValue({
        shareOpen: true,
        openShareModal: mockOpenShareModal,
        closeShareModal: mockCloseShareModal,
      });

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader documentId="doc-1" documentToken="token-1" />,
      );

      expect(screen.getByTestId("share-modal")).toBeInTheDocument();
    });

    it("passes documentId to ShareModal", () => {
      mockUseDocumentEditorStore.mockReturnValue({
        shareOpen: true,
        openShareModal: mockOpenShareModal,
        closeShareModal: mockCloseShareModal,
      });

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader
          documentId="document-123"
          documentToken="token-123"
        />,
      );

      expect(screen.getByText("document-123")).toBeInTheDocument();
    });

    it("passes documentToken to ShareModal", () => {
      mockUseDocumentEditorStore.mockReturnValue({
        shareOpen: true,
        openShareModal: mockOpenShareModal,
        closeShareModal: mockCloseShareModal,
      });

      currentUserDetailsResult = {
        data: {
          role: "OWNER",
        },
        isLoading: false,
        isError: false,
      };

      render(
        <DocumentsEditorHeader
          documentId="document-123"
          documentToken="token-123"
        />,
      );

      expect(screen.getByText("token-123")).toBeInTheDocument();
    });
  });
});
