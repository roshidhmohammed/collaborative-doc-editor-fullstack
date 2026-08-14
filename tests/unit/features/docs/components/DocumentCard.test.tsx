import { render, screen } from '@testing-library/react';
import DocumentCard from '@/features/docs/components/DocumentCard';

describe('DocumentCard', () => {
  it('renders the document name and collaborator count', () => {
    render(
      <DocumentCard
        document={{
          id: '1',
          name: 'Test Doc',
          collaborators: [{ user: { id: 'u1', fullName: 'Jane Doe', email: 'jane@example.com' }, role: 'EDITOR', isCreator: false, onlineStatus: 'online' }],
          associatedRoleToken: 'token',
        }}
      />,
    );

    expect(screen.getByText(/test doc/i)).toBeInTheDocument();
    expect(screen.getByText(/1 collab/i)).toBeInTheDocument();
  });
});
