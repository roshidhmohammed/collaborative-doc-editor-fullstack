import { render, screen } from '@testing-library/react';
import { useActionState as useActionStateMock } from 'react';

jest.mock('@/features/auth/actions/handleLogin', () => ({
  handleLogin: jest.fn(),
}));

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useActionState: jest.fn(),
  };
});

import LoginForm from '@/features/auth/components/LoginForm';

describe('LoginForm', () => {
  const mockUseActionState = useActionStateMock as jest.MockedFunction<typeof useActionStateMock>;
  const formAction = '/login-action';

  beforeEach(() => {
    mockUseActionState.mockClear();
    mockUseActionState.mockReturnValue([undefined, formAction, false] as any);
  });

  it('renders the email field and password field and submit button', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('uses the returned formAction as the form action', () => {
    render(<LoginForm />);
    const form = screen.getByRole('button', { name: /login/i }).closest('form');
    expect(form).toHaveAttribute('action', formAction);
  });

  it('disables the Login button when pending is true', () => {
    mockUseActionState.mockReturnValue([undefined, formAction, true] as any);
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /loading\.\.\./i })).toBeDisabled();
  });
});
