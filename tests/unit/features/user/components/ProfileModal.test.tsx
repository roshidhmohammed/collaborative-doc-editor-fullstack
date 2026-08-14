import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProfileModal from "@/features/user/components/ProfileModal";
import { handleLogout } from "@/features/user/actions/logout";

jest.mock("@/features/user/actions/logout", () => ({
  handleLogout: jest.fn(),
}));

describe("ProfileModal", () => {
  const mockHandleLogout =
    handleLogout as jest.MockedFunction<typeof handleLogout>;

  const userData = {
    fullName: "Jane Doe",
    email: "jane@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the user's full name", () => {
      render(<ProfileModal userData={userData} />);

      expect(
        screen.getByText("Jane Doe"),
      ).toBeInTheDocument();
    });

    it("renders the user's email", () => {
      render(<ProfileModal userData={userData} />);

      expect(
        screen.getByText("jane@example.com"),
      ).toBeInTheDocument();
    });

    it("renders the logout button", () => {
      render(<ProfileModal userData={userData} />);

      expect(
        screen.getByRole("button", {
          name: /logout/i,
        }),
      ).toBeInTheDocument();
    });

    it("renders the logout button with type button", () => {
      render(<ProfileModal userData={userData} />);

      expect(
        screen.getByRole("button", {
          name: /logout/i,
        }),
      ).toHaveAttribute("type", "button");
    });
  });

describe("Logout", () => {
  it("does not call handleLogout before clicking logout", () => {
    render(<ProfileModal userData={userData} />);

    expect(mockHandleLogout).not.toHaveBeenCalled();
  });

  it("calls handleLogout when logout is clicked", async () => {
    const user = userEvent.setup();

    mockHandleLogout.mockResolvedValue(undefined);

    render(<ProfileModal userData={userData} />);

    await user.click(
      screen.getByRole("button", {
        name: /logout/i,
      }),
    );

    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });

  it("calls handleLogout only once for one click", async () => {
    const user = userEvent.setup();

    mockHandleLogout.mockResolvedValue(undefined);

    render(<ProfileModal userData={userData} />);

    await user.click(
      screen.getByRole("button", {
        name: /logout/i,
      }),
    );

    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });
});

  describe("User data", () => {
    it("renders different user information correctly", () => {
      render(
        <ProfileModal
          userData={{
            fullName: "John Smith",
            email: "john@example.com",
          }}
        />,
      );

      expect(
        screen.getByText("John Smith"),
      ).toBeInTheDocument();

      expect(
        screen.getByText("john@example.com"),
      ).toBeInTheDocument();
    });

    it("does not crash when user data fields are missing", () => {
      render(
        <ProfileModal
          userData={
            {
              fullName: undefined,
              email: undefined,
            } as any
          }
        />,
      );

      expect(
        screen.getByRole("button", {
          name: /logout/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
