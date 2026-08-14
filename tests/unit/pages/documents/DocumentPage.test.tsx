import { getCookies } from '@/lib/auth/session';
import { verifySession } from '@/lib/dal/auth';
import { assignCollaborator } from '@/features/collaborators/services/assign-collaborator';
import { notFound } from 'next/navigation';
import DocumentPage from '@/app/(documents)/documents/[id]/[documentToken]/page';

jest.mock('@/lib/auth/session', () => ({
  getCookies: jest.fn(),
}));

jest.mock('@/lib/dal/auth', () => ({
  verifySession: jest.fn(),
}));

jest.mock('@/features/collaborators/services/assign-collaborator', () => ({
  assignCollaborator: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound');
  }),
}));

describe('DocumentPage', () => {
  const mockGetCookies = getCookies as jest.MockedFunction<typeof getCookies>;
  const mockVerifySession = verifySession as jest.MockedFunction<typeof verifySession>;
  const mockAssignCollaborator = assignCollaborator as jest.MockedFunction<typeof assignCollaborator>;
  const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

  beforeEach(() => {
    mockGetCookies.mockClear();
    mockVerifySession.mockClear();
    mockAssignCollaborator.mockClear();
    mockNotFound.mockClear();
  });

  it('calls getCookies and verifySession when the page is rendered', async () => {
    mockGetCookies.mockResolvedValue('token' as never);
    mockVerifySession.mockResolvedValue('session' as never);
    mockAssignCollaborator.mockResolvedValue(undefined as never);

    const tree = await DocumentPage({ params: { id: 'doc-1', documentToken: 'abc' } });

    expect(mockGetCookies).toHaveBeenCalledTimes(1);
    expect(mockVerifySession).toHaveBeenCalledTimes(1);
    expect(mockAssignCollaborator).toHaveBeenCalledWith('doc-1', 'session', 'abc');
    expect(tree.type).toBe('main');
  });

  it('passes the correct props to Editor and CollaboratorList', async () => {
    mockGetCookies.mockResolvedValue('token' as never);
    mockVerifySession.mockResolvedValue('session' as never);
    mockAssignCollaborator.mockResolvedValue(undefined as never);

    const tree = await DocumentPage({ params: { id: 'doc-2', documentToken: 'token-2' } });
    const content = tree.props.children.props.children;
    const collaboratorList = content[1].props.children[1];

    expect(collaboratorList.type.name).toBe('CollaboratorList');
    expect(collaboratorList.props.documentId).toBe('doc-2');
    expect(collaboratorList.props.session).toBe('session');
  });

  it('calls notFound when documentId is missing', async () => {
    mockGetCookies.mockResolvedValue('token' as never);
    mockVerifySession.mockResolvedValue('session' as never);

    await expect(DocumentPage({ params: { id: '', documentToken: 'abc' } })).rejects.toThrow('notFound');
    expect(mockAssignCollaborator).not.toHaveBeenCalled();
  });

  it('calls notFound when documentToken is missing', async () => {
    mockGetCookies.mockResolvedValue('token' as never);
    mockVerifySession.mockResolvedValue('session' as never);

    await expect(DocumentPage({ params: { id: 'doc-3', documentToken: '' } })).rejects.toThrow('notFound');
    expect(mockAssignCollaborator).not.toHaveBeenCalled();
  });

  it('does not call assignCollaborator when verifySession fails', async () => {
    mockVerifySession.mockRejectedValue(new Error('auth failed'));
    mockGetCookies.mockResolvedValue('token' as never);

    await expect(DocumentPage({ params: { id: 'doc-4', documentToken: 'token-4' } })).rejects.toThrow('auth failed');
    expect(mockAssignCollaborator).not.toHaveBeenCalled();
  });
});
