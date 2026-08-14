import { render, screen } from '@testing-library/react';

jest.mock('@/features/auth/components/RegisterForm', () => ({
  __esModule: true,
  default: () => <form data-testid="register-form" />,
}));

import RegisterPage from '@/app/(auth)/register/page';

describe('RegisterPage', () => {
  it('renders the heading', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders the RegisterForm component', () => {
    render(<RegisterPage />);

    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('renders the Login link', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('sets the Login link href to /login', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
  });
});
