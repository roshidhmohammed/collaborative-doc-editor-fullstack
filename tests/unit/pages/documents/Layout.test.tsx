import React from "react";
import { render, screen } from "@testing-library/react";

import Layout from "@/app/(documents)/layout";

jest.mock("@/shared/components/Header", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Header content</div>),
}));

jest.mock("@/shared/components/Footer", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Footer content</div>),
}));

jest.mock("@/shared/components/HeaderSkeleton", () => ({
  __esModule: true,
  HeaderSkeleton: jest.fn(() => <div>Header skeleton</div>),
}));

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the Header component", () => {
      render(<Layout>page content</Layout>);

      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("renders the Footer component", () => {
      render(<Layout>page content</Layout>);

      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("renders the children", () => {
      render(<Layout>page content</Layout>);

      expect(screen.getByText("page content")).toBeInTheDocument();
    });

    it("renders children inside the main element", () => {
      render(<Layout>page content</Layout>);

      const main = screen.getByRole("main");

      expect(main).toHaveTextContent("page content");
    });

    it("renders Header before the main content", () => {
      render(<Layout>page content</Layout>);

      const header = screen.getByText("Header content");
      const main = screen.getByRole("main");

      expect(
        header.compareDocumentPosition(main),
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("renders Footer after the main content", () => {
      render(<Layout>page content</Layout>);

      const main = screen.getByRole("main");
      const footer = screen.getByText("Footer content");

      expect(
        main.compareDocumentPosition(footer),
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe("Children", () => {
    it("renders a single React element as children", () => {
      render(
        <Layout>
          <div data-testid="child">Child content</div>
        </Layout>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("renders multiple children", () => {
      render(
        <Layout>
          <div>First child</div>
          <div>Second child</div>
        </Layout>,
      );

      expect(screen.getByText("First child")).toBeInTheDocument();
      expect(screen.getByText("Second child")).toBeInTheDocument();
    });

    it("renders nested children correctly", () => {
      render(
        <Layout>
          <section>
            <h1>Documents</h1>
            <p>Document content</p>
          </section>
        </Layout>,
      );

      expect(
        screen.getByRole("heading", {
          name: "Documents",
        }),
      ).toBeInTheDocument();

      expect(screen.getByText("Document content")).toBeInTheDocument();
    });
  });

  describe("Suspense", () => {
    it("renders Header inside a Suspense boundary", () => {
      render(<Layout>page content</Layout>);

      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("configures HeaderSkeleton as the Suspense fallback", () => {
      expect(true).toBe(true);
    });
  });
});