import { render, screen } from '@testing-library/react';
import CollaboratorList from '@/features/collaborators/components/CollaboratorList';
import { useDocumentEditorStore } from '@/store/document-editor';

jest.mock('@/store/document-editor', () => ({
  useDocumentEditorStore: jest.fn(),
}));

describe('CollaboratorList', () => {
  const mockUseDocumentEditorStore = useDocumentEditorStore as jest.MockedFunction<typeof useDocumentEditorStore>;

  beforeEach(() => {
    mockUseDocumentEditorStore.mockReset();
  });

  it('renders empty state when there are no collaborators', () => {
    mockUseDocumentEditorStore.mockImplementation((selector) => selector({ collaborators: [] }));
    render(<CollaboratorList documentId="1" session="1" />);

    expect(screen.getByText(/no collaborators yet/i)).toBeInTheDocument();
  });

it("renders collaborators with proper labels and statuses", () => {
  mockUseDocumentEditorStore.mockImplementation((selector) =>
    selector({
      collaborators: [
        {
          documentId: "cmsfiqk76000kz8sbcqfs5abx",
          id: null,
          invitedBy: null,
          isCreator: true,
          joinedAt: null,
          onlineStatus: "online",
          role: "OWNER",
          userId: "d4beda30-6dd2-496a-93d3-996acf3e66d3",
          user: {
            email: "tester1@gmail.com",
            fullName: "tester1",
            id: "d4beda30-6dd2-496a-93d3-996acf3e66d3",
          },
        },
      ],
    }),
  );

  render(
    <CollaboratorList
      documentId="cmsfiqk76000kz8sbcqfs5abx"
      session={{
        userId: "d4beda30-6dd2-496a-93d3-996acf3e66d3",
      } as any}
    />,
  );

  expect(screen.getByText("You")).toBeInTheDocument();
  expect(screen.getByText("tester1@gmail.com")).toBeInTheDocument();
  expect(screen.getByText("OWNER")).toBeInTheDocument();
  expect(screen.getByText("Owner")).toBeInTheDocument();
  expect(screen.getByText("online")).toBeInTheDocument();
});
});
