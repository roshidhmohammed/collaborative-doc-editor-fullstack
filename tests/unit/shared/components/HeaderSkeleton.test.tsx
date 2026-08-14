import { render, screen } from '@testing-library/react';
import { HeaderSkeleton } from '@/shared/components/HeaderSkeleton';

describe('HeaderSkeleton', () => {
  it('renders the header skeleton structure', () => {
    render(<HeaderSkeleton />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByText((content, element) => element?.className.includes('animate-pulse'))).toHaveLength(3);
  });
});
