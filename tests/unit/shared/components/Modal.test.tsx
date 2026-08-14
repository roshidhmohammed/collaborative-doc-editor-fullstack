import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/shared/components/Modal';

describe('Modal', () => {
  it('renders the dialog with title and children', () => {
    const handleClose = jest.fn();

    render(
      <Modal title="Title" description="Description" onClose={handleClose}>
        <div>content</div>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(
      <Modal title="Title" description="Description" onClose={handleClose}>
        <div>content</div>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: /close modal/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
