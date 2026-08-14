import { render, screen } from '@testing-library/react';

jest.mock('@/features/auth/components/LoginForm', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form" />,
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  it('renders the heading', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders the LoginForm component', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders the Create Account link', () => {
    render(<LoginPage />);

    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
  });

  it('sets the Create Account link href to /register', () => {
    render(<LoginPage />);

    expect(screen.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/register');
  });
});
