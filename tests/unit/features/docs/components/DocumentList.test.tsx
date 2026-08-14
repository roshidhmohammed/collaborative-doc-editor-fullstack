import React from "react";
import { render, screen } from "@testing-library/react";

import DocumentList from "@/features/docs/components/DocumentList";
import { getAllDocuments } from "@/features/docs/services/get-all-documents";

jest.mock("@/features/docs/services/get-all-documents", () => ({
  getAllDocuments: jest.fn(),
}));

jest.mock("@/features/docs/components/DocumentCard", () => ({
  __esModule: true,
  default: ({ document }: { document: any }) => (
    <div data-testid="document-card">
      {document.name}
    </div>
  ),
}));

jest.mock("@/features/docs/components/CreateDocumentCard", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="create-document-card">
      Create Document Card
    </div>
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href}>
      {children}
    </a>
  ),
}));

describe("DocumentList", () => {
  const mockGetAllDocuments =
    getAllDocuments as jest.MockedFunction<
      typeof getAllDocuments
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("calls getAllDocuments when rendered", async () => {
      mockGetAllDocuments.mockResolvedValue([]);

      await DocumentList();

      expect(
        mockGetAllDocuments,
      ).toHaveBeenCalledTimes(1);
    });

    it("renders the create document card", async () => {
      mockGetAllDocuments.mockResolvedValue([]);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.getByTestId("create-document-card"),
      ).toBeInTheDocument();
    });

    it("renders all documents when documents are available", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-1",
          name: "Document One",
          associatedRoleToken: "token-1",
        },
        {
          id: "doc-2",
          name: "Document Two",
          associatedRoleToken: "token-2",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.getByText("Document One"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Document Two"),
      ).toBeInTheDocument();

      expect(
        screen.getAllByTestId("document-card"),
      ).toHaveLength(2);
    });

    it("renders the empty state when there are no documents", async () => {
      mockGetAllDocuments.mockResolvedValue([]);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.getByText(
          /no documents yet\. create your first one to get started/i,
        ),
      ).toBeInTheDocument();
    });

    it("does not render the empty state when documents exist", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-1",
          name: "Document One",
          associatedRoleToken: "token-1",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.queryByText(
          /no documents yet\. create your first one to get started/i,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe("Document links", () => {
    it("creates the correct document URL", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-123",
          name: "My Document",
          associatedRoleToken: "owner-token",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      const link = screen.getByRole("link");

      expect(link).toHaveAttribute(
        "href",
        "/documents/doc-123/owner-token",
      );
    });

    it("creates separate links for multiple documents", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-1",
          name: "Document One",
          associatedRoleToken: "token-one",
        },
        {
          id: "doc-2",
          name: "Document Two",
          associatedRoleToken: "token-two",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      const links = screen.getAllByRole("link");

      expect(links).toHaveLength(2);

      expect(links[0]).toHaveAttribute(
        "href",
        "/documents/doc-1/token-one",
      );

      expect(links[1]).toHaveAttribute(
        "href",
        "/documents/doc-2/token-two",
      );
    });

    it("renders each document card inside its corresponding link", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-1",
          name: "Document One",
          associatedRoleToken: "token-one",
        },
        {
          id: "doc-2",
          name: "Document Two",
          associatedRoleToken: "token-two",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      const links = screen.getAllByRole("link");

      expect(links[0]).toContainElement(
        screen.getByText("Document One"),
      );

      expect(links[1]).toContainElement(
        screen.getByText("Document Two"),
      );
    });
  });

  describe("Empty result", () => {
    it("renders only the create document card when the result is empty", async () => {
      mockGetAllDocuments.mockResolvedValue([]);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.getByTestId("create-document-card"),
      ).toBeInTheDocument();

      expect(
        screen.queryByTestId("document-card"),
      ).not.toBeInTheDocument();

      expect(
        screen.queryAllByRole("link"),
      ).toHaveLength(0);
    });
  });

  describe("Multiple documents", () => {
    it("renders the correct number of document cards", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-1",
          name: "Document One",
          associatedRoleToken: "token-1",
        },
        {
          id: "doc-2",
          name: "Document Two",
          associatedRoleToken: "token-2",
        },
        {
          id: "doc-3",
          name: "Document Three",
          associatedRoleToken: "token-3",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.getAllByTestId("document-card"),
      ).toHaveLength(3);
    });

    it("preserves the document names returned by the service", async () => {
      mockGetAllDocuments.mockResolvedValue([
        {
          id: "doc-1",
          name: "Project Planning",
          associatedRoleToken: "token-1",
        },
        {
          id: "doc-2",
          name: "Meeting Notes",
          associatedRoleToken: "token-2",
        },
      ] as any);

      const tree = await DocumentList();

      render(tree);

      expect(
        screen.getByText("Project Planning"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("Meeting Notes"),
      ).toBeInTheDocument();
    });
  });

  describe("Service errors", () => {
    it("propagates errors from getAllDocuments", async () => {
      const error = new Error(
        "Failed to fetch documents",
      );

      mockGetAllDocuments.mockRejectedValue(error);

      await expect(
        DocumentList(),
      ).rejects.toThrow(
        "Failed to fetch documents",
      );
    });
  });
});

