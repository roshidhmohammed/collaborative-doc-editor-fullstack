import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import TiptapEditor from "@/features/docEditor/components/TiptapEditor";

import {
  useFetchDocumentDetails,
} from "@/features/docEditor/hooks/useFetchDocumentDetails";

import { useEditor } from "@tiptap/react";

jest.mock(
  "@/features/docEditor/hooks/useFetchDocumentDetails",
  () => ({
    useFetchDocumentDetails: jest.fn(),
    selectCanEditDocument: jest.fn(),
  }),
);

jest.mock("@tiptap/react", () => ({
  EditorContent: jest.fn(
    ({ editor }: { editor: unknown }) => (
      <div data-testid="editor-content">
        Editor Content
        <span data-testid="editor-instance">
          {editor ? "initialized" : "not-initialized"}
        </span>
      </div>
    ),
  ),

  useEditor: jest.fn(),
}));

jest.mock("@tiptap/starter-kit", () => ({
  __esModule: true,

  default: {
    configure: jest.fn((options) => ({
      type: "starter-kit",
      options,
    })),
  },
}));

jest.mock("@tiptap/extension-highlight", () => ({
  __esModule: true,

  default: {
    name: "highlight",
  },
}));

jest.mock("@tiptap/extension-text-align", () => ({
  __esModule: true,

  default: {
    configure: jest.fn((options) => ({
      type: "text-align",
      options,
    })),
  },
}));

jest.mock("@tiptap/extension-typography", () => ({
  __esModule: true,

  default: {
    name: "typography",
  },
}));

jest.mock("@tiptap/extension-collaboration", () => ({
  __esModule: true,

  default: {
    configure: jest.fn((options) => ({
      type: "collaboration",
      options,
    })),
  },
}));

jest.mock(
  "@/features/docEditor/components/Menubar",
  () => ({
    __esModule: true,

    default: jest.fn(() => (
      <div data-testid="menubar">
        Menubar
      </div>
    )),
  }),
);

describe("TiptapEditor", () => {
  const mockUseFetchDocumentDetails =
    useFetchDocumentDetails as jest.MockedFunction<
      typeof useFetchDocumentDetails
    >;

  const mockUseEditor =
    useEditor as jest.MockedFunction<
      typeof useEditor
    >;

  const mockSetEditable = jest.fn();

  const mockEditor = {
    setEditable: mockSetEditable,
  } as any;

  const mockYdoc = {} as any;

  const defaultProps = {
    ydoc: mockYdoc,
    connectionStatus: "connected",
    documentToken: "document-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFetchDocumentDetails.mockReturnValue({
      data: false,
    } as any);

    mockUseEditor.mockReturnValue(
      mockEditor,
    );
  });

  describe("Loading state", () => {
    it("renders creating editor when editor is not initialized", () => {
      mockUseEditor.mockReturnValue(
        null as any,
      );

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.getByText(
          /creating editor/i,
        ),
      ).toBeInTheDocument();
    });

    it("does not render editor content while editor is unavailable", () => {
      mockUseEditor.mockReturnValue(
        null as any,
      );

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.queryByTestId(
          "editor-content",
        ),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByTestId("menubar"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Rendering", () => {
    it("renders editor content when editor is initialized", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: true,
      } as any);

      mockUseEditor.mockReturnValue(
        mockEditor,
      );

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.getByTestId(
          "editor-content",
        ),
      ).toBeInTheDocument();
    });

    it("renders the initialized editor instance", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.getByTestId(
          "editor-instance",
        ),
      ).toHaveTextContent(
        "initialized",
      );
    });

    it("renders realtime connection status", () => {
      render(
        <TiptapEditor
          {...defaultProps}
          connectionStatus="connected"
        />,
      );

      expect(
        screen.getByText(
          /realtime status: connected/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders disconnected status", () => {
      render(
        <TiptapEditor
          {...defaultProps}
          connectionStatus="disconnected"
        />,
      );

      expect(
        screen.getByText(
          /realtime status: disconnected/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders error connection status", () => {
      render(
        <TiptapEditor
          {...defaultProps}
          connectionStatus="error"
        />,
      );

      expect(
        screen.getByText(
          /realtime status: error/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Editing permissions", () => {
    it("renders Menubar when the user can edit", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: true,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.getByTestId("menubar"),
      ).toBeInTheDocument();
    });

    it("does not render Menubar when the user cannot edit", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: false,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.queryByTestId("menubar"),
      ).not.toBeInTheDocument();
    });

    it("uses false as the default canEdit value", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: undefined,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        screen.queryByTestId("menubar"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Document details query", () => {
    it("passes the document token to useFetchDocumentDetails", () => {
      render(
        <TiptapEditor
          {...defaultProps}
          documentToken="token-123"
        />,
      );

      expect(
        mockUseFetchDocumentDetails,
      ).toHaveBeenCalledWith(
        "token-123",
        expect.objectContaining({
          select: expect.any(Function),
        }),
      );
    });

    it("calls useFetchDocumentDetails once", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        mockUseFetchDocumentDetails,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("Editor initialization", () => {
    it("calls useEditor", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        mockUseEditor,
      ).toHaveBeenCalledTimes(1);
    });

    it("sets immediatelyRender to false", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        mockUseEditor,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          immediatelyRender: false,
        }),
      );
    });

    it("sets editable based on canEdit", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: true,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        mockUseEditor,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          editable: true,
        }),
      );
    });

    it("sets editable to false when user cannot edit", () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: false,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        mockUseEditor,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          editable: false,
        }),
      );
    });
  });

  describe("Editor configuration", () => {
    it("passes the Y.Doc to the editor configuration", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      const editorConfig =
        mockUseEditor.mock.calls[0][0];

      expect(
        editorConfig,
      ).toEqual(
        expect.objectContaining({
          extensions:
            expect.arrayContaining([
              expect.objectContaining({
                type: "collaboration",
                options: expect.objectContaining({
                  document: mockYdoc,
                  field: "default",
                }),
              }),
            ]),
        }),
      );
    });

    it("configures collaboration with the default field", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      const editorConfig =
        mockUseEditor.mock.calls[0][0];

      const collaboration =
        editorConfig.extensions.find(
          (extension: any) =>
            extension.type ===
            "collaboration",
        );

      expect(
        collaboration,
      ).toEqual(
        expect.objectContaining({
          type: "collaboration",
          options: expect.objectContaining({
            document: mockYdoc,
            field: "default",
          }),
        }),
      );
    });

    it("configures StarterKit with undoRedo disabled", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      const editorConfig =
        mockUseEditor.mock.calls[0][0];

      const starterKit =
        editorConfig.extensions.find(
          (extension: any) =>
            extension.type ===
            "starter-kit",
        );

      expect(
        starterKit,
      ).toEqual(
        expect.objectContaining({
          type: "starter-kit",
          options: {
            undoRedo: false,
          },
        }),
      );
    });

    it("configures TextAlign for headings and paragraphs", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      const editorConfig =
        mockUseEditor.mock.calls[0][0];

      const textAlign =
        editorConfig.extensions.find(
          (extension: any) =>
            extension.type ===
            "text-align",
        );

      expect(
        textAlign,
      ).toEqual(
        expect.objectContaining({
          type: "text-align",
          options: {
            types: [
              "heading",
              "paragraph",
            ],
          },
        }),
      );
    });

    it("includes Highlight extension", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      const editorConfig =
        mockUseEditor.mock.calls[0][0];

      expect(
        editorConfig.extensions,
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "highlight",
          }),
        ]),
      );
    });

    it("includes Typography extension", () => {
      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      const editorConfig =
        mockUseEditor.mock.calls[0][0];

      expect(
        editorConfig.extensions,
      ).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "typography",
          }),
        ]),
      );
    });
  });

  describe("Editable state synchronization", () => {
    it("calls setEditable with the current canEdit value", async () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: true,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      await waitFor(() => {
        expect(
          mockSetEditable,
        ).toHaveBeenCalledWith(true);
      });
    });

    it("sets editor to non-editable when canEdit is false", async () => {
      mockUseFetchDocumentDetails.mockReturnValue({
        data: false,
      } as any);

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      await waitFor(() => {
        expect(
          mockSetEditable,
        ).toHaveBeenCalledWith(false);
      });
    });

    it("does not call setEditable when editor is unavailable", () => {
      mockUseEditor.mockReturnValue(
        null as any,
      );

      render(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      expect(
        mockSetEditable,
      ).not.toHaveBeenCalled();
    });
  });

  describe("Permission transitions", () => {
    it("updates editor editable state when canEdit changes", async () => {
      let canEdit = false;

      mockUseFetchDocumentDetails.mockImplementation(
        () =>
          ({
            data: canEdit,
          }) as any,
      );

      const { rerender } =
        render(
          <TiptapEditor
            {...defaultProps}
          />,
        );

      await waitFor(() => {
        expect(
          mockSetEditable,
        ).toHaveBeenCalledWith(false);
      });

      mockSetEditable.mockClear();

      canEdit = true;

      rerender(
        <TiptapEditor
          {...defaultProps}
        />,
      );

      await waitFor(() => {
        expect(
          mockSetEditable,
        ).toHaveBeenCalledWith(true);
      });
    });
  });
});