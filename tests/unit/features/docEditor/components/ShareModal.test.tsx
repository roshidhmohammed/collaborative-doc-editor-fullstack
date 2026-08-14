import React from "react";

import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import ShareModal from "@/features/docEditor/components/ShareModal";

import {
  useFetchDocumentDetails,
} from "@/features/docEditor/hooks/useFetchDocumentDetails";

import {
  copyToClipboard,
} from "@/features/docEditor/utils/clipboard";

/* -------------------------------------------------------------------------- */
/* Mocks                                                                      */
/* -------------------------------------------------------------------------- */

jest.mock(
  "@/features/docEditor/hooks/useFetchDocumentDetails",
  () => ({
    useFetchDocumentDetails: jest.fn(),
    selectDocumentShareLinks: jest.fn(),
  }),
);

jest.mock(
  "@/features/docEditor/utils/clipboard",
  () => ({
    copyToClipboard: jest.fn(),
  }),
);

jest.mock("@/shared/components/Modal", () => ({
  __esModule: true,

  default: ({
    title,
    description,
    children,
    onClose,
  }: {
    title: string;
    description?: string;
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div role="dialog">
      <h2>{title}</h2>

      {description && (
        <p>{description}</p>
      )}

      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
      >
        Close
      </button>

      {children}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Copy: () => (
    <span data-testid="copy-icon" />
  ),
}));

/* -------------------------------------------------------------------------- */
/* Test suite                                                                 */
/* -------------------------------------------------------------------------- */

describe("ShareModal", () => {
  const mockUseFetchDocumentDetails =
    useFetchDocumentDetails as jest.MockedFunction<
      typeof useFetchDocumentDetails
    >;

  const mockCopyToClipboard =
    copyToClipboard as jest.MockedFunction<
      typeof copyToClipboard
    >;

  const mockSetShareOpen = jest.fn();

  const shareLinks = [
    {
      documentId: "doc-1",
      token: "viewer-token",
      role: "VIEWER",
      isActive: true,
    },
    {
      documentId: "doc-1",
      token: "editor-token",
      role: "EDITOR",
      isActive: true,
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Setup                                                                    */
  /* ------------------------------------------------------------------------ */

  beforeEach(() => {
    jest.clearAllMocks();

    mockCopyToClipboard.mockResolvedValue(
      undefined,
    );

    mockUseFetchDocumentDetails.mockReturnValue({
      data: shareLinks,
      isLoading: false,
      isError: false,
    } as any);
  });

  /* ------------------------------------------------------------------------ */
  /* Rendering                                                                */
  /* ------------------------------------------------------------------------ */

  describe("Rendering", () => {
    it("renders the share modal", () => {
      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("dialog"),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", {
          name: "Share document",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Choose access for the shared link.",
        ),
      ).toBeInTheDocument();
    });

    it("renders the access level select", () => {
      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("combobox"),
      ).toBeInTheDocument();
    });

    it("renders Viewer and Editor options", () => {
      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("option", {
          name: "Viewer",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("option", {
          name: "Editor",
        }),
      ).toBeInTheDocument();
    });

    it("defaults to Viewer", () => {
      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("combobox"),
      ).toHaveValue("VIEWER");
    });

    it("renders the Copy icon", () => {
      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByTestId("copy-icon"),
      ).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Role selection                                                           */
  /* ------------------------------------------------------------------------ */

  describe("Role selection", () => {
    it("changes from Viewer to Editor", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      const select =
        screen.getByRole("combobox");

      await user.selectOptions(
        select,
        "EDITOR",
      );

      expect(select).toHaveValue("EDITOR");
    });

    it("changes from Editor back to Viewer", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      const select =
        screen.getByRole("combobox");

      await user.selectOptions(
        select,
        "EDITOR",
      );

      await user.selectOptions(
        select,
        "VIEWER",
      );

      expect(select).toHaveValue("VIEWER");
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Share link                                                               */
  /* ------------------------------------------------------------------------ */

  describe("Share link", () => {
    it("enables Copy link for Viewer", () => {
      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeEnabled();
    });

    it("enables Copy link for Editor", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.selectOptions(
        screen.getByRole("combobox"),
        "EDITOR",
      );

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeEnabled();
    });

    it("disables Copy link when role has no link", async () => {
      const user = userEvent.setup();

      mockUseFetchDocumentDetails.mockReturnValue({
        data: [
          {
            documentId: "doc-1",
            token: "viewer-token",
            role: "VIEWER",
            isActive: true,
          },
        ],
        isLoading: false,
        isError: false,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.selectOptions(
        screen.getByRole("combobox"),
        "EDITOR",
      );

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeDisabled();
    });

    it("disables Copy link when link is inactive", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: [
          {
            documentId: "doc-1",
            token: "viewer-token",
            role: "VIEWER",
            isActive: false,
          },
        ],
        isLoading: false,
        isError: false,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeDisabled();
    });

    it("disables Copy link when there are no links", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeDisabled();

      expect(
        mockCopyToClipboard,
      ).not.toHaveBeenCalled();
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Clipboard                                                                */
  /* ------------------------------------------------------------------------ */

  describe("Copy link", () => {
    it("copies the Viewer share link", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      );

      expect(
        mockCopyToClipboard,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCopyToClipboard,
      ).toHaveBeenCalledWith(
        `${window.location.origin}/documents/doc-1/viewer-token`,
      );

      expect(
        screen.getByRole("button", {
          name: "Copied!",
        }),
      ).toBeInTheDocument();
    });

    it("copies the Editor share link", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.selectOptions(
        screen.getByRole("combobox"),
        "EDITOR",
      );

      await user.click(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      );

      expect(
        mockCopyToClipboard,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCopyToClipboard,
      ).toHaveBeenCalledWith(
        `${window.location.origin}/documents/doc-1/editor-token`,
      );

      expect(
        screen.getByRole("button", {
          name: "Copied!",
        }),
      ).toBeInTheDocument();
    });

    it("shows Copied after successful copy", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      );

      expect(
        screen.getByRole("button", {
          name: "Copied!",
        }),
      ).toBeInTheDocument();
    });

    it("does not copy when there is no share link", async () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      const button =
        screen.getByRole("button", {
          name: "Copy link",
        });

      expect(button).toBeDisabled();

      expect(
        mockCopyToClipboard,
      ).not.toHaveBeenCalled();
    });

    it("handles clipboard failure", async () => {
      const user = userEvent.setup();

      mockCopyToClipboard.mockRejectedValueOnce(
        new Error("Clipboard failed"),
      );

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      );

      expect(
        mockCopyToClipboard,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockCopyToClipboard,
      ).toHaveBeenCalledWith(
        `${window.location.origin}/documents/doc-1/viewer-token`,
      );

      expect(
        screen.queryByRole("button", {
          name: "Copied!",
        }),
      ).not.toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  describe("Loading state", () => {
    it("shows Loading link while loading", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("button", {
          name: "Loading link...",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Loading link...",
        }),
      ).toBeDisabled();
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  describe("Error state", () => {
    it("renders error message", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("alert"),
      ).toHaveTextContent(
        "We couldn't load the sharing links.",
      );
    });

    it("disables Copy link when error has no link", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
      } as any);

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        screen.getByRole("button", {
          name: "Copy link",
        }),
      ).toBeDisabled();
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Modal                                                                    */
  /* ------------------------------------------------------------------------ */

  describe("Modal close", () => {
    it("calls setShareOpen(false)", async () => {
      const user = userEvent.setup();

      render(
        <ShareModal
          documentToken="document-token"
          documentId="doc-1"
          setShareOpen={mockSetShareOpen}
        />,
      );

      await user.click(
        screen.getByRole("button", {
          name: "Close modal",
        }),
      );

      expect(
        mockSetShareOpen,
      ).toHaveBeenCalledTimes(1);

      expect(
        mockSetShareOpen,
      ).toHaveBeenCalledWith(false);
    });
  });

  /* ------------------------------------------------------------------------ */
  /* Data fetching                                                            */
  /* ------------------------------------------------------------------------ */

  describe("Data fetching", () => {
    it("passes document token to useFetchDocumentDetails", () => {
      render(
        <ShareModal
          documentToken="my-document-token"
          documentId="doc-123"
          setShareOpen={mockSetShareOpen}
        />,
      );

      expect(
        mockUseFetchDocumentDetails,
      ).toHaveBeenCalledWith(
        "my-document-token",
        expect.objectContaining({
          select: expect.any(Function),
        }),
      );
    });
  });
});