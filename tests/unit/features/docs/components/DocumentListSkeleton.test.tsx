import { render, screen } from "@testing-library/react";

import { DocumentListSkeleton } from "@/features/docs/components/DocumentListSkeleton";

describe("DocumentListSkeleton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the skeleton list container", () => {
      render(<DocumentListSkeleton />);

      expect(
        screen.getByTestId("document-list-skeleton"),
      ).toBeInTheDocument();
    });

    it("renders exactly four skeleton cards", () => {
      render(<DocumentListSkeleton />);

      expect(
        screen.getAllByTestId("document-card-skeleton"),
      ).toHaveLength(4);
    });

    it("renders an accent bar for every skeleton card", () => {
      render(<DocumentListSkeleton />);

      expect(
        screen.getAllByTestId("skeleton-accent"),
      ).toHaveLength(4);
    });

    it("renders a title skeleton for every card", () => {
      render(<DocumentListSkeleton />);

      expect(
        screen.getAllByTestId("skeleton-title"),
      ).toHaveLength(4);
    });

    it("renders a collaborator badge for every card", () => {
      render(<DocumentListSkeleton />);

      expect(
        screen.getAllByTestId("skeleton-collaborator"),
      ).toHaveLength(4);
    });
  });

  describe("Skeleton styling", () => {
    it("applies animate-pulse to every skeleton card", () => {
      render(<DocumentListSkeleton />);

      const cards = screen.getAllByTestId(
        "document-card-skeleton",
      );

      cards.forEach((card) => {
        expect(card).toHaveClass("animate-pulse");
      });
    });

    it("applies the skeleton background to the accent bars", () => {
      render(<DocumentListSkeleton />);

      const accentBars = screen.getAllByTestId(
        "skeleton-accent",
      );

      accentBars.forEach((accent) => {
        expect(accent).toHaveClass("bg-slate-700");
      });
    });

    it("applies the skeleton background to the titles", () => {
      render(<DocumentListSkeleton />);

      const titles = screen.getAllByTestId(
        "skeleton-title",
      );

      titles.forEach((title) => {
        expect(title).toHaveClass("bg-slate-700");
      });
    });

    it("applies the skeleton background to collaborator badges", () => {
      render(<DocumentListSkeleton />);

      const badges = screen.getAllByTestId(
        "skeleton-collaborator",
      );

      badges.forEach((badge) => {
        expect(badge).toHaveClass("bg-slate-700");
      });
    });
  });

  describe("Structure", () => {
it("renders all skeleton elements inside their respective cards", () => {
  render(<DocumentListSkeleton />);

  const cards = screen.getAllByTestId(
    "document-card-skeleton",
  );

  const accents = screen.getAllByTestId(
    "skeleton-accent",
  );

  const titles = screen.getAllByTestId(
    "skeleton-title",
  );

  const collaborators = screen.getAllByTestId(
    "skeleton-collaborator",
  );

  expect(cards).toHaveLength(4);
  expect(accents).toHaveLength(4);
  expect(titles).toHaveLength(4);
  expect(collaborators).toHaveLength(4);

  cards.forEach((card, index) => {
    expect(card).toContainElement(accents[index]);
    expect(card).toContainElement(titles[index]);
    expect(card).toContainElement(collaborators[index]);
  });
});
  });
});