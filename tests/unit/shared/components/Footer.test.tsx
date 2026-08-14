import { render, screen } from "@testing-library/react";

jest.mock("next/cache", () => ({
  cacheLife: jest.fn(),
}));

import Footer from "@/shared/components/Footer";
import { socialLinks } from "@/shared/constants/footerData";

describe("Footer", () => {
  it("renders the developer name and all social links", async () => {
    const footer = await Footer();
    render(footer);

    expect(screen.getByText(/developed by/i)).toBeInTheDocument();
    expect(screen.getByText(/mohammed roshidh s/i)).toBeInTheDocument();

    socialLinks.forEach((link) => {
      const anchor = screen.getByRole("link", { name: link.label });
      expect(anchor).toHaveAttribute("href", link.href);
      expect(anchor).toHaveAttribute("target", "_blank");
      expect(anchor).toHaveAttribute("rel", "noreferrer");
    });
  });
});
