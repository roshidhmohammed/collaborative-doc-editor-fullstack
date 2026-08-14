import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileMenu } from "@/features/user/components/ProfileMenu";

jest.mock("@/features/user/components/ProfileModal", () => ({
  __esModule: true,
  default: ({ userData }: any) => (
    <div data-testid="profile-modal">
      <span>{userData?.fullName}</span>
      <span>{userData?.email}</span>
    </div>
  ),
}));

describe("ProfileMenu", () => {
  const userData = {
    fullName: "Jane Doe",
    email: "jane@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the profile menu button", () => {
      render(<ProfileMenu userData={userData} />);

      expect(
        screen.getByRole("button", {
          name: /open profile menu/i,
        }),
      ).toBeInTheDocument();
    });

    it("renders the menu closed initially", () => {
      render(<ProfileMenu userData={userData} />);

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();
    });

    it("renders the profile button with the correct type", () => {
      render(<ProfileMenu userData={userData} />);

      const button = screen.getByRole("button", {
        name: /open profile menu/i,
      });

      expect(button).toHaveAttribute("type", "button");
    });

    it("renders an accessible profile menu button", () => {
      render(<ProfileMenu userData={userData} />);

      expect(
        screen.getByLabelText("Open profile menu"),
      ).toBeInTheDocument();
    });
  });

  describe("Menu toggle", () => {
    it("opens the profile modal when the button is clicked", async () => {
      const user = userEvent.setup();

      render(<ProfileMenu userData={userData} />);

      const button = screen.getByRole("button", {
        name: /open profile menu/i,
      });

      await user.click(button);

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();
    });

    it("closes the profile modal when the button is clicked again", async () => {
      const user = userEvent.setup();

      render(<ProfileMenu userData={userData} />);

      const button = screen.getByRole("button", {
        name: /open profile menu/i,
      });

      await user.click(button);

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();

      await user.click(button);

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();
    });

    it("can open and close the menu multiple times", async () => {
      const user = userEvent.setup();

      render(<ProfileMenu userData={userData} />);

      const button = screen.getByRole("button", {
        name: /open profile menu/i,
      });

      await user.click(button);

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();

      await user.click(button);

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();

      await user.click(button);

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();

      await user.click(button);

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Profile data", () => {
    it("passes the user full name to ProfileModal", async () => {
      const user = userEvent.setup();

      render(<ProfileMenu userData={userData} />);

      await user.click(
        screen.getByRole("button", {
          name: /open profile menu/i,
        }),
      );

      expect(
        screen.getByText("Jane Doe"),
      ).toBeInTheDocument();
    });

    it("passes the user email to ProfileModal", async () => {
      const user = userEvent.setup();

      render(<ProfileMenu userData={userData} />);

      await user.click(
        screen.getByRole("button", {
          name: /open profile menu/i,
        }),
      );

      expect(
        screen.getByText("jane@example.com"),
      ).toBeInTheDocument();
    });
  });

  describe("Outside click behavior", () => {
    it("closes the menu when clicking outside", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <ProfileMenu userData={userData} />

          <button type="button">
            Outside
          </button>
        </div>,
      );

      await user.click(
        screen.getByRole("button", {
          name: /open profile menu/i,
        }),
      );

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Outside",
        }),
      );

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();
    });

    it("does not close the menu when clicking inside the menu", async () => {
      const user = userEvent.setup();

      render(<ProfileMenu userData={userData} />);

      await user.click(
        screen.getByRole("button", {
          name: /open profile menu/i,
        }),
      );

      const modal = screen.getByTestId("profile-modal");

      await user.click(modal);

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();
    });

    it("closes the menu when a mousedown occurs outside", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <ProfileMenu userData={userData} />

          <button type="button">
            Outside
          </button>
        </div>,
      );

      await user.click(
        screen.getByRole("button", {
          name: /open profile menu/i,
        }),
      );

      expect(
        screen.getByTestId("profile-modal"),
      ).toBeInTheDocument();

      await user.pointer({
        target: screen.getByRole("button", {
          name: "Outside",
        }),
        keys: "[MouseLeft]",
      });

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Event listener lifecycle", () => {
    it("registers a mousedown event listener", () => {
      const addEventListenerSpy = jest.spyOn(
        document,
        "addEventListener",
      );

      render(<ProfileMenu userData={userData} />);

      expect(
        addEventListenerSpy,
      ).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function),
      );

      addEventListenerSpy.mockRestore();
    });

    it("removes the mousedown event listener when unmounted", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener",
      );

      const { unmount } = render(
        <ProfileMenu userData={userData} />,
      );

      unmount();

      expect(
        removeEventListenerSpy,
      ).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe("Menu state", () => {
    it("keeps the menu closed after an outside click when already closed", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <ProfileMenu userData={userData} />

          <button type="button">
            Outside
          </button>
        </div>,
      );

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", {
          name: "Outside",
        }),
      );

      expect(
        screen.queryByTestId("profile-modal"),
      ).not.toBeInTheDocument();
    });
  });
});

