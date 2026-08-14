import { render, screen } from '@testing-library/react';
import Header from '@/shared/components/Header';
import { fetchUserProfile } from '@/features/user/services/user-profile';

jest.mock('@/features/user/services/user-profile', () => ({
  fetchUserProfile: jest.fn(),
}));

jest.mock('@/features/user/components/ProfileMenu', () => ({
  ProfileMenu: ({ userData }: { userData: any }) => (
    <div data-testid="profile-menu">{userData?.fullName}</div>
  ),
}));

describe('Header', () => {
  const mockFetchUserProfile = fetchUserProfile as jest.MockedFunction<typeof fetchUserProfile>;

  beforeEach(() => {
    mockFetchUserProfile.mockClear();
  });

  it('renders the app link and ProfileMenu with fetched user data', async () => {
    mockFetchUserProfile.mockResolvedValue({ fullName: 'Jane Doe', email: 'jane@example.com' } as any);
    const tree = await Header();
    const { container } = render(tree as any);

    expect(screen.getByRole('link', { name: /collab doc creator/i })).toHaveAttribute('href', '/documents');
    expect(screen.getByTestId('profile-menu')).toHaveTextContent('Jane Doe');
  });
});
