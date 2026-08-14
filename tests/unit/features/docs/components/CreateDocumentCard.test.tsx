import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateDocument from "@/features/docs/components/CreateDocuments";
import { toast } from "sonner";

const mockPush = jest.fn();
const mockFormAction = jest.fn();

jest.mock("@/features/docs/actions/create-document", () => ({
  createDocument: jest.fn(),
}));

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    useActionState: jest.fn(),
  };
});

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("CreateDocument", () => {
  let mockUseActionState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const React = require("react");

    mockUseActionState = React.useActionState;

    mockUseActionState.mockReturnValue([
      {
        message: "",
        errors: "",
      },
      mockFormAction,
      false,
    ]);
  });

  describe("Rendering", () => {
    it("renders the document creation heading", () => {
      render(<CreateDocument />);

      expect(
        screen.getByText( /new document/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders the document creation description", () => {
      render(<CreateDocument />);

      expect(
        screen.getByText(
          /start with a topic and build your collaborative document from there/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders the topic input", () => {
      render(<CreateDocument />);

      expect(
        screen.getByPlaceholderText(
          /e\.g\. product launch plan/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders the topic field label", () => {
      render(<CreateDocument />);

      expect(
        screen.getByLabelText(
          /enter the topic \(topic to create a document\)/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders the create button", () => {
      render(<CreateDocument />);

      expect(
        screen.getByRole("button", {
          name: /^create$/i,
        }),
      ).toBeInTheDocument();
    });

it("marks the topic input as required", () => {
  render(<CreateDocument />);

  const input = screen.getByLabelText(
    /Enter the Topic \(topic to create a document\)/i,
  );

  expect(input).toBeRequired();
});
  });

  describe("User interaction", () => {
    it("allows the user to enter a document topic", async () => {
      const user = userEvent.setup();

      render(<CreateDocument />);

      const input = screen.getByRole("textbox", {
        name: /enter the topic/i,
      });

      await user.type(
        input,
        "Product launch plan",
      );

      expect(input).toHaveValue(
        "Product launch plan",
      );
    });
  });

  describe("Loading state", () => {
    it("shows Loading while document creation is pending", () => {
      mockUseActionState.mockReturnValue([
        {
          message: "",
          errors: "",
        },
        mockFormAction,
        true,
      ]);

      render(<CreateDocument />);

      expect(
        screen.getByRole("button", {
          name: /loading/i,
        }),
      ).toBeInTheDocument();
    });

    it("disables the create button while pending", () => {
      mockUseActionState.mockReturnValue([
        {
          message: "",
          errors: "",
        },
        mockFormAction,
        true,
      ]);

      render(<CreateDocument />);

      expect(
        screen.getByRole("button", {
          name: /loading/i,
        }),
      ).toBeDisabled();
    });
  });

  describe("Validation errors", () => {
    it("renders the title validation error", () => {
      mockUseActionState.mockReturnValue([
        {
          message: "Validation failed",
          errors: {
            title: [
              "Document title is required",
            ],
          },
        },
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      expect(
        screen.getByText(
          "Document title is required",
        ),
      ).toBeInTheDocument();
    });

    it("does not render a title error when errors is a string", () => {
      mockUseActionState.mockReturnValue([
        {
          message: "Something went wrong",
          errors: "Something went wrong",
        },
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      expect(
        screen.queryByText(
          "Something went wrong",
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe("Successful document creation", () => {
    const successState = {
      success: true,
      message: "Document created successfully",
      errors: "",
      docDetails: {
        document: {
          id: "doc-123",
        },
        ownerToken: "owner-token-123",
      },
    };

    it("shows a success toast", async () => {
      mockUseActionState.mockReturnValue([
        successState,
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      await waitFor(() => {
        expect(
          toast.success,
        ).toHaveBeenCalledWith(
          "Document created successfully",
        );
      });
    });

    it("redirects to the created document", async () => {
      mockUseActionState.mockReturnValue([
        successState,
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          "/documents/doc-123/owner-token-123",
        );
      });
    });

    it("calls success toast only once", async () => {
      mockUseActionState.mockReturnValue([
        successState,
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      await waitFor(() => {
        expect(
          toast.success,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Failed document creation", () => {
    it("does not redirect when creation fails", async () => {
      mockUseActionState.mockReturnValue([
        {
          success: false,
          message: "Failed to create document",
          errors: "",
        },
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("does not show a success toast when creation fails", async () => {
      mockUseActionState.mockReturnValue([
        {
          success: false,
          message: "Failed to create document",
          errors: "",
        },
        mockFormAction,
        false,
      ]);

      render(<CreateDocument />);

      await waitFor(() => {
        expect(
          toast.success,
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe("useActionState", () => {
    it("initializes useActionState", () => {
      render(<CreateDocument />);

      expect(
        mockUseActionState,
      ).toHaveBeenCalledTimes(1);
    });

    it("uses the expected initial state", () => {
      render(<CreateDocument />);

      expect(
        mockUseActionState.mock.calls[0][1],
      ).toEqual({
        message: "",
        errors: "",
      });
    });
  });
});