import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/shared/components/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders loading state and disables button when loading=true', () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByRole('button', { name: /loading\.\.\./i })).toBeDisabled();
  });

  it('forwards native button props and merges className', () => {
    render(
      <Button type="submit" className="custom-class">
        Save
      </Button>,
    );

    expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('button', { name: /save/i })).toHaveClass('custom-class');
  });
});
