import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { jest } from "@jest/globals";
import ProfileModal from "@/features/user/components/ProfileModal";
import { handleLogout } from "@/features/user/actions/logout";
import { authenticatedUser } from "../../../fixtures/auth/users";


jest.unstable_mockModule(
  "@/features/auth/actions/logout",
  () => ({
    handleLogout: jest.fn(),
  }),
);



const mockHandleLogout =
  handleLogout as jest.MockedFunction<
    typeof handleLogout
  >;

describe("ProfileModal Integration", () => {
  const userData = {
    fullName: "John Doe",
    email: "john@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the user's profile information", () => {
      render(
        <ProfileModal userData={authenticatedUser} />,
      );

      expect(
        screen.getByText(userData.fullName),
      ).toBeInTheDocument();

      expect(
        screen.getByText(userData.email),
      ).toBeInTheDocument();
    });

    it("renders the logout button", () => {
      render(
        <ProfileModal userData={authenticatedUser} />,
      );

      expect(
        screen.getByRole("button", {
          name: /logout/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("logout interaction", () => {
    it("calls the logout action when the user clicks logout", async () => {
      const user = userEvent.setup();

      mockHandleLogout.mockResolvedValue(
        undefined,
      );

      render(
        <ProfileModal userData={authenticatedUser} />,
      );

      await user.click(
        screen.getByRole("button", {
          name: /logout/i,
        }),
      );

      expect(
        mockHandleLogout,
      ).toHaveBeenCalledTimes(1);
    });
  });
});