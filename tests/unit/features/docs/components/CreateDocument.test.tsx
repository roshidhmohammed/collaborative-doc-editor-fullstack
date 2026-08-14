import React from "react";
import { render, screen } from "@testing-library/react";

import CreateDocumentCard from "@/features/docs/components/CreateDocumentCard";
import { PAGEROUTES } from "@/shared/constants/apiRoutes";

jest.mock("lucide-react", () => ({
  FilePlus2: () => (
    <svg
      data-testid="file-plus-icon"
      aria-hidden="true"
    />
  ),
}));

describe("CreateDocumentCard", () => {
  /**
   * The component is async, so resolve it first.
   */
  const renderComponent = async () => {
    const component = await CreateDocumentCard();

    return render(component);
  };

  describe("Rendering", () => {
    it("renders the create document card", async () => {
      await renderComponent();

      expect(
        screen.getByRole("link"),
      ).toBeInTheDocument();
    });

    it("renders the document creation title", async () => {
      await renderComponent();

      expect(
        screen.getByRole("heading", {
          name: /create new document/i,
        }),
      ).toBeInTheDocument();
    });

    it("renders the document creation description", async () => {
      await renderComponent();

      expect(
        screen.getByText(
          /start a fresh document with a topic and invite collaborators instantly/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders the FilePlus2 icon", async () => {
      await renderComponent();

      expect(
        screen.getByTestId("file-plus-icon"),
      ).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("renders the correct create document URL", async () => {
      await renderComponent();

      const link = screen.getByRole("link");

      expect(link).toHaveAttribute(
        "href",
        PAGEROUTES.CREATE_DOCUMENT,
      );
    });

    it("makes the entire card a clickable link", async () => {
      await renderComponent();

      const link = screen.getByRole("link");

      expect(link).toContainElement(
        screen.getByRole("heading", {
          name: /create new document/i,
        }),
      );

      expect(link).toContainElement(
        screen.getByText(
          /start a fresh document/i,
        ),
      );
    });
  });

  describe("Accessibility", () => {
    it("provides an accessible navigation link", async () => {
      await renderComponent();

      expect(
        screen.getByRole("link"),
      ).toBeInTheDocument();
    });

    it("provides a heading for the card content", async () => {
      await renderComponent();

      expect(
        screen.getByRole("heading", {
          name: /create new document/i,
        }),
      ).toBeInTheDocument();
    });

    it("marks the decorative icon as hidden from assistive technology", async () => {
      await renderComponent();

      expect(
        screen.getByTestId("file-plus-icon"),
      ).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });
});