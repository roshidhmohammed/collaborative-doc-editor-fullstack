import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/shared/components/Input';

describe('Input', () => {
  it('renders an input and forwards props', () => {
    render(<Input id="email" name="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText(/email/i);

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'email');
  });

  it('renders the error message when error is provided', () => {
    render(<Input id="email" error="email id is required" />);
    expect(screen.getByText(/email id is required/i)).toBeInTheDocument();
  });

  it('triggers onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Input id="name" name="name" onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'abc');

    expect(handleChange).toHaveBeenCalled();
  });
});
