import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from '@/shared/components/PasswordInput';

describe('PasswordInput', () => {
  it('renders with type="password" initially and toggles visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput id="password" name="password" />);

    const input = container.querySelector<HTMLInputElement>('input[name="password"]');
    const toggle = screen.getByRole('button');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
    await user.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    await user.click(toggle);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('preserves value when toggling and forwards error styling', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput id="password" name="password" error="Bad" />);

    const input = container.querySelector<HTMLInputElement>('input[name="password"]');
    expect(input).toBeInTheDocument();
    await user.type(input!, 'secret');

    expect(screen.getByText(/bad/i)).toBeInTheDocument();
    expect(input).toHaveValue('secret');
  });
});
