import { render, screen } from '@testing-library/react';
import { useActionState as useActionStateMock } from 'react';
import RegisterForm from '@/features/auth/components/RegisterForm';

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useActionState: jest.fn(),
    useEffect: ActualReact.useEffect,
  };
});

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('RegisterForm', () => {
  const mockUseActionState = useActionStateMock as jest.MockedFunction<typeof useActionStateMock>;
  const formAction = '/register-action';

  beforeEach(() => {
    mockUseActionState.mockClear();
    mockUseActionState.mockReturnValue([undefined, formAction, false] as any);
  });

  it('renders four form fields and the Register button', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2);
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('uses the returned formAction as the form action', () => {
    render(<RegisterForm />);
    const form = screen.getByRole('button', { name: /register/i }).closest('form');
    expect(form).toHaveAttribute('action', formAction);
  });

   it('disables the Register button when pending is true', () => {
      mockUseActionState.mockReturnValue([undefined, formAction, true] as any);
      render(<RegisterForm />);
  
      expect(screen.getByRole('button', { name: /loading\.\.\./i })).toBeDisabled();
    });
});
