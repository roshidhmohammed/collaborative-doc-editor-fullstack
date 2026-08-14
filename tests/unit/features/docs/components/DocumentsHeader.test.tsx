import { render, screen } from '@testing-library/react';
import DocumentsHeader from '@/features/docs/components/DocumentsHeader';

describe('DocumentsHeader', () => {
  it('renders workspace and heading text', () => {
    render(<DocumentsHeader />);

    expect(screen.getByText(/workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your documents/i })).toBeInTheDocument();
    expect(screen.getByText(/jump back into work/i)).toBeInTheDocument();
  });
});
