import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Menubar from "@/features/docEditor/components/Menubar";

import { useEditorState } from "@tiptap/react";

/* -------------------------------------------------------------------------- */
/*                                   Mocks                                    */
/* -------------------------------------------------------------------------- */

jest.mock("@tiptap/react", () => ({
  useEditorState: jest.fn(),
}));

/* -------------------------------------------------------------------------- */
/*                              Editor factory                                */
/* -------------------------------------------------------------------------- */

const createMockEditor = () => {
  const editor: any = {
    chain: jest.fn(),
    focus: jest.fn(),
    toggleHeading: jest.fn(),
    setParagraph: jest.fn(),
    toggleBold: jest.fn(),
    toggleItalic: jest.fn(),
    toggleStrike: jest.fn(),
    toggleHighlight: jest.fn(),
    setTextAlign: jest.fn(),
    run: jest.fn(),
    isActive: jest.fn().mockReturnValue(false),
  };

  /*
   * Tiptap commands return the chain object so commands can
   * be chained like:
   *
   * editor.chain().focus().toggleBold().run()
   */

  editor.chain.mockReturnValue(editor);
  editor.focus.mockReturnValue(editor);
  editor.toggleHeading.mockReturnValue(editor);
  editor.setParagraph.mockReturnValue(editor);
  editor.toggleBold.mockReturnValue(editor);
  editor.toggleItalic.mockReturnValue(editor);
  editor.toggleStrike.mockReturnValue(editor);
  editor.toggleHighlight.mockReturnValue(editor);
  editor.setTextAlign.mockReturnValue(editor);

  return editor;
};

/* -------------------------------------------------------------------------- */
/*                              Default editor state                           */
/* -------------------------------------------------------------------------- */

const defaultEditorState = {
  isBold: false,
  isItalic: false,
  isStrike: false,
  isHighlight: false,

  isAlignLeft: false,
  isAlignCenter: false,
  isAlignRight: false,
  isAlignJustify: false,

  isParagraph: false,

  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
};

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe("Menubar", () => {
  const mockUseEditorState =
    useEditorState as jest.MockedFunction<
      typeof useEditorState
    >;

  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    jest.clearAllMocks();

    editor = createMockEditor();

    mockUseEditorState.mockReturnValue(
      defaultEditorState as any,
    );
  });

  /* ======================================================================== */
  /*                              Rendering                                    */
  /* ======================================================================== */

  describe("Rendering", () => {
    it("renders the menubar", () => {
      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", { name: "H1" }),
      ).toBeInTheDocument();
    });

    it("renders all toolbar buttons", () => {
      render(<Menubar editor={editor} />);

      const buttons = [
        "H1",
        "H2",
        "H3",
        "Paragraph",
        "Bold",
        "Italic",
        "Strike",
        "Highlight",
        "Left",
        "Center",
        "Right",
        "Justify",
      ];

      buttons.forEach((button) => {
        expect(
          screen.getByRole("button", {
            name: button,
          }),
        ).toBeInTheDocument();
      });
    });

    it("renders exactly twelve toolbar buttons", () => {
      render(<Menubar editor={editor} />);

      expect(
        screen.getAllByRole("button"),
      ).toHaveLength(12);
    });

    it("renders all buttons with type button", () => {
      render(<Menubar editor={editor} />);

      screen
        .getAllByRole("button")
        .forEach((button) => {
          expect(button).toHaveAttribute(
            "type",
            "button",
          );
        });
    });
  });

  /* ======================================================================== */
  /*                              H1                                           */
  /* ======================================================================== */

  describe("Heading commands", () => {
    it("executes H1 command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "H1",
        }),
      );

      expect(
        editor.toggleHeading,
      ).toHaveBeenCalledWith({
        level: 1,
      });

      expect(editor.run).toHaveBeenCalled();
    });

    it("executes H2 command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "H2",
        }),
      );

      expect(
        editor.toggleHeading,
      ).toHaveBeenCalledWith({
        level: 2,
      });

      expect(editor.run).toHaveBeenCalled();
    });

    it("executes H3 command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "H3",
        }),
      );

      expect(
        editor.toggleHeading,
      ).toHaveBeenCalledWith({
        level: 3,
      });

      expect(editor.run).toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                              Paragraph                                    */
  /* ======================================================================== */

  describe("Paragraph command", () => {
    it("executes paragraph command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Paragraph",
        }),
      );

      expect(
        editor.setParagraph,
      ).toHaveBeenCalledTimes(1);

      expect(editor.run).toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                              Text formatting                              */
  /* ======================================================================== */

  describe("Text formatting commands", () => {
    it("executes Bold command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Bold",
        }),
      );

      expect(
        editor.toggleBold,
      ).toHaveBeenCalledTimes(1);

      expect(editor.run).toHaveBeenCalled();
    });

    it("executes Italic command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Italic",
        }),
      );

      expect(
        editor.toggleItalic,
      ).toHaveBeenCalledTimes(1);

      expect(editor.run).toHaveBeenCalled();
    });

    it("executes Strike command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Strike",
        }),
      );

      expect(
        editor.toggleStrike,
      ).toHaveBeenCalledTimes(1);

      expect(editor.run).toHaveBeenCalled();
    });

    it("executes Highlight command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Highlight",
        }),
      );

      expect(
        editor.toggleHighlight,
      ).toHaveBeenCalledTimes(1);

      expect(editor.run).toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                              Alignment                                    */
  /* ======================================================================== */

  describe("Text alignment commands", () => {
    it("sets left alignment", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Left",
        }),
      );

      expect(
        editor.setTextAlign,
      ).toHaveBeenCalledWith("left");

      expect(editor.run).toHaveBeenCalled();
    });

    it("sets center alignment", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Center",
        }),
      );

      expect(
        editor.setTextAlign,
      ).toHaveBeenCalledWith("center");

      expect(editor.run).toHaveBeenCalled();
    });

    it("sets right alignment", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Right",
        }),
      );

      expect(
        editor.setTextAlign,
      ).toHaveBeenCalledWith("right");

      expect(editor.run).toHaveBeenCalled();
    });

    it("sets justify alignment", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Justify",
        }),
      );

      expect(
        editor.setTextAlign,
      ).toHaveBeenCalledWith("justify");

      expect(editor.run).toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                              Editor chain                                 */
  /* ======================================================================== */

  describe("Editor command chain", () => {
    it("starts every command with editor.chain()", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Bold",
        }),
      );

      expect(
        editor.chain,
      ).toHaveBeenCalledTimes(1);
    });

    it("focuses the editor before executing a command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Italic",
        }),
      );

      expect(
        editor.focus,
      ).toHaveBeenCalledTimes(1);
    });

    it("runs the Tiptap command", async () => {
      const user = userEvent.setup();

      render(<Menubar editor={editor} />);

      await user.click(
        screen.getByRole("button", {
          name: "Bold",
        }),
      );

      expect(
        editor.run,
      ).toHaveBeenCalledTimes(1);
    });
  });

  /* ======================================================================== */
  /*                              Active states                                */
  /* ======================================================================== */

  describe("Active button states", () => {
    it("applies active class to H1 when H1 is active", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isHeading1: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "H1",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to H2 when H2 is active", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isHeading2: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "H2",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to H3 when H3 is active", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isHeading3: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "H3",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Paragraph", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isParagraph: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Paragraph",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Bold", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isBold: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Bold",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Italic", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isItalic: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Italic",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Strike", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isStrike: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Strike",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Highlight", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isHighlight: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Highlight",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Left alignment", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isAlignLeft: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Left",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Center alignment", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isAlignCenter: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Center",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Right alignment", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isAlignRight: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Right",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });

    it("applies active class to Justify alignment", () => {
      mockUseEditorState.mockReturnValue({
        ...defaultEditorState,
        isAlignJustify: true,
      } as any);

      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Justify",
        }),
      ).toHaveClass(
        "font-bold",
        "bg-red-800",
      );
    });
  });

  /* ======================================================================== */
  /*                              Inactive states                              */
  /* ======================================================================== */

  describe("Inactive button states", () => {
    it("does not apply active class when formatting is inactive", () => {
      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Bold",
        }),
      ).not.toHaveClass("bg-red-800");

      expect(
        screen.getByRole("button", {
          name: "Italic",
        }),
      ).not.toHaveClass("bg-red-800");
    });

    it("does not apply active class to alignment buttons when inactive", () => {
      render(<Menubar editor={editor} />);

      expect(
        screen.getByRole("button", {
          name: "Left",
        }),
      ).not.toHaveClass("bg-red-800");

      expect(
        screen.getByRole("button", {
          name: "Center",
        }),
      ).not.toHaveClass("bg-red-800");

      expect(
        screen.getByRole("button", {
          name: "Right",
        }),
      ).not.toHaveClass("bg-red-800");

      expect(
        screen.getByRole("button", {
          name: "Justify",
        }),
      ).not.toHaveClass("bg-red-800");
    });
  });
});