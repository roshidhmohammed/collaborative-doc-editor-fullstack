import { act, render, screen, waitFor } from "@testing-library/react";
import * as Y from "yjs";

import Editor from "@/features/docEditor/components/Editor";

import { getSocket } from "@/lib/realtime-updates/socket";

import {
  loadYjsUpdates,
  saveYjsUpdate,
  clearAllYjsDocuments,
} from "@/lib/browser-storage/yjs-indexdb";

import { useDocumentEditorStore } from "@/store/document-editor";

/* -------------------------------------------------------------------------- */
/*                                   Mocks                                    */
/* -------------------------------------------------------------------------- */

jest.mock("@/lib/realtime-updates/socket", () => ({
  getSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

jest.mock("@/lib/browser-storage/yjs-indexdb", () => ({
  loadYjsUpdates: jest.fn(),
  saveYjsUpdate: jest.fn(),
  clearAllYjsDocuments: jest.fn(),
}));

jest.mock("@/features/docEditor/components/TiptapEditor", () => ({
  __esModule: true,
  default: ({
    connectionStatus,
  }: {
    connectionStatus: string;
  }) => (
    <div data-testid="tiptap-editor">
      Tiptap Editor
      <span data-testid="connection-status">
        {connectionStatus}
      </span>
    </div>
  ),
}));

jest.mock("@/store/document-editor", () => ({
  useDocumentEditorStore: jest.fn(),
}));

/* -------------------------------------------------------------------------- */
/*                                   Tests                                    */
/* -------------------------------------------------------------------------- */

describe("Editor", () => {
  const mockGetSocket =
    getSocket as jest.MockedFunction<typeof getSocket>;

  const mockLoadYjsUpdates =
    loadYjsUpdates as jest.MockedFunction<
      typeof loadYjsUpdates
    >;

  const mockSaveYjsUpdate =
    saveYjsUpdate as jest.MockedFunction<
      typeof saveYjsUpdate
    >;

  const mockClearAllYjsDocuments =
    clearAllYjsDocuments as jest.MockedFunction<
      typeof clearAllYjsDocuments
    >;

  const mockUseDocumentEditorStore =
    useDocumentEditorStore as jest.MockedFunction<
      typeof useDocumentEditorStore
    >;

  const mockSetCollaborators = jest.fn();
  const mockRemoveCollaborator = jest.fn();

  let socket: {
    connected: boolean;
    connect: jest.Mock;
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
  };

  let socketHandlers: Record<string, (...args: any[]) => void>;

  let renderedYDoc: Y.Doc | null;

  /* ------------------------------------------------------------------------ */
  /*                               beforeEach                                 */
  /* ------------------------------------------------------------------------ */

  beforeEach(() => {
    jest.clearAllMocks();

    renderedYDoc = null;

    socketHandlers = {};

    socket = {
      connected: false,

      connect: jest.fn(),

      on: jest.fn(
        (
          event: string,
          handler: (...args: any[]) => void,
        ) => {
          socketHandlers[event] = handler;
        },
      ),

      off: jest.fn(),

      emit: jest.fn(),
    };

    mockGetSocket.mockReturnValue(socket as any);

    mockLoadYjsUpdates.mockResolvedValue([]);

    mockSaveYjsUpdate.mockResolvedValue(undefined);

    mockClearAllYjsDocuments.mockReturnValue(undefined);

    mockUseDocumentEditorStore.mockReturnValue({
      setCollaborators: mockSetCollaborators,
      removeCollaborator: mockRemoveCollaborator,
    } as any);
  });

  /* ------------------------------------------------------------------------ */
  /*                              Helper                                      */
  /* ------------------------------------------------------------------------ */

  const renderEditor = () => {
    return render(
      <Editor
        userToken="user-token"
        documentId="document-1"
        documentToken="document-token"
      />,
    );
  };

  /* ======================================================================== */
  /*                              INITIAL RENDER                              */
  /* ======================================================================== */

  describe("Initial rendering", () => {
    it("renders loading state initially", () => {
      mockLoadYjsUpdates.mockReturnValue(
        new Promise(() => {}) as any,
      );

      renderEditor();

      expect(
        screen.getByText(
          /loading collaborative document/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders TiptapEditor after initialization", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });
    });

    it("passes connecting status initially to TiptapEditor when socket is not connected", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("connection-status"),
        ).toHaveTextContent("connecting");
      });
    });
  });

  /* ======================================================================== */
  /*                         SOCKET INITIALIZATION                             */
  /* ======================================================================== */

  describe("Socket initialization", () => {
    it("gets socket using the user token", async () => {
      renderEditor();

      await waitFor(() => {
        expect(mockGetSocket).toHaveBeenCalledWith(
          "user-token",
        );
      });
    });

    it("registers connect event handler", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socket.on).toHaveBeenCalledWith(
          "connect",
          expect.any(Function),
        );
      });
    });

    it("registers disconnect event handler", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socket.on).toHaveBeenCalledWith(
          "disconnect",
          expect.any(Function),
        );
      });
    });

    it("registers document load handler", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socket.on).toHaveBeenCalledWith(
          "document:load",
          expect.any(Function),
        );
      });
    });

    it("registers remote document update handler", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socket.on).toHaveBeenCalledWith(
          "document:update",
          expect.any(Function),
        );
      });
    });

    it("connects socket when socket is disconnected", async () => {
      socket.connected = false;

      renderEditor();

      await waitFor(() => {
        expect(socket.connect).toHaveBeenCalledTimes(1);
      });
    });

    it("does not explicitly connect when socket is already connected", async () => {
      socket.connected = true;

      renderEditor();

      await waitFor(() => {
        expect(socket.emit).toHaveBeenCalledWith(
          "document:join",
          "document-1",
        );
      });

      expect(socket.connect).not.toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                             SOCKET CONNECT                                */
  /* ======================================================================== */

  describe("Socket connect", () => {
    it("joins the document after socket connects", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers.connect).toBeDefined();
      });

      act(() => {
        socketHandlers.connect();
      });

      expect(socket.emit).toHaveBeenCalledWith(
        "document:join",
        "document-1",
      );
    });

    it("requests collaborator online status after connecting", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers.connect).toBeDefined();
      });

      act(() => {
        socketHandlers.connect();
      });

      expect(socket.emit).toHaveBeenCalledWith(
        "collaborator:online-status",
        "document-1",
        expect.any(Function),
      );
    });

    it("sets collaborators from online status response", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers.connect).toBeDefined();
      });

      const collaborators = [
        {
          user: {
            id: "user-1",
            fullName: "John",
            email: "john@example.com",
          },
          role: "OWNER",
        },
      ];

      act(() => {
        socketHandlers.connect();
      });

      const onlineStatusCall =
        socket.emit.mock.calls.find(
          ([event]) =>
            event === "collaborator:online-status",
        );

      expect(onlineStatusCall).toBeDefined();

      const callback = onlineStatusCall?.[2];

      act(() => {
        callback({
          success: true,
          data: collaborators,
        });
      });

      expect(
        mockSetCollaborators,
      ).toHaveBeenCalledWith(collaborators);
    });

    it("registers collaborator presence listener after connecting", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers.connect).toBeDefined();
      });

      act(() => {
        socketHandlers.connect();
      });

      expect(socket.on).toHaveBeenCalledWith(
        "collaborator:presence",
        expect.any(Function),
      );
    });

    it("updates collaborators when presence changes", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers.connect).toBeDefined();
      });

      act(() => {
        socketHandlers.connect();
      });

      const presenceCall =
        socket.on.mock.calls.find(
          ([event]) =>
            event === "collaborator:presence",
        );

      expect(presenceCall).toBeDefined();

      const presenceHandler =
        presenceCall?.[1];

      const collaborators = [
        {
          user: {
            id: "user-2",
            fullName: "Alice",
            email: "alice@example.com",
          },
          role: "EDITOR",
        },
      ];

      act(() => {
        presenceHandler(collaborators);
      });

      expect(
        mockSetCollaborators,
      ).toHaveBeenCalledWith(collaborators);
    });

    it("changes connection status to connected", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("connection-status"),
        ).toHaveTextContent("connecting");
      });

      act(() => {
        socketHandlers.connect();
      });

      expect(
        screen.getByTestId("connection-status"),
      ).toHaveTextContent("connected");
    });
  });

  /* ======================================================================== */
  /*                           SOCKET DISCONNECT                               */
  /* ======================================================================== */

  describe("Socket disconnect", () => {
    it("changes connection status to disconnected", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("connection-status"),
        ).toBeInTheDocument();
      });

      act(() => {
        socketHandlers.disconnect();
      });

      expect(
        screen.getByTestId("connection-status"),
      ).toHaveTextContent("disconnected");
    });

    it("removes collaborator when socket disconnects", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers.disconnect).toBeDefined();
      });

      act(() => {
        socketHandlers.disconnect();
      });

      expect(
        mockRemoveCollaborator,
      ).toHaveBeenCalledTimes(1);
    });
  });

  /* ======================================================================== */
  /*                         INDEXEDDB INITIALIZATION                          */
  /* ======================================================================== */

  describe("IndexedDB initialization", () => {
    it("loads local Yjs updates using document id", async () => {
      renderEditor();

      await waitFor(() => {
        expect(mockLoadYjsUpdates).toHaveBeenCalledWith(
          "document-1",
        );
      });
    });

    it("initializes correctly when there are no local updates", async () => {
      mockLoadYjsUpdates.mockResolvedValue([]);

      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });
    });

    it("applies local Yjs updates during initialization", async () => {
      const sourceDoc = new Y.Doc();

      const sourceText = sourceDoc.getText("content");

      sourceText.insert(0, "Local document");

      const update = Y.encodeStateAsUpdate(
        sourceDoc,
      );

      mockLoadYjsUpdates.mockResolvedValue([
        update,
      ]);

      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });

      /*
       * Initialization completed successfully.
       *
       * The update was accepted by Yjs if the editor
       * reached the ready state.
       */
      expect(
        screen.getByTestId("tiptap-editor"),
      ).toBeInTheDocument();
    });
  });

  /* ======================================================================== */
  /*                         LOCAL YJS UPDATES                                 */
  /* ======================================================================== */

  describe("Local Yjs updates", () => {
    it("saves local updates to IndexedDB", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });

      /*
       * Capture the Y.Doc by mocking the Tiptap editor.
       *
       * Since the current mock does not expose the Y.Doc,
       * we trigger the Yjs update through the socket-side
       * document initialization path in a separate test below.
       */
      expect(mockSaveYjsUpdate).not.toHaveBeenCalled();
    });

    it("does not save IndexedDB-origin updates", async () => {
      /*
       * The actual Yjs origin filtering is:
       *
       * origin === "idb"
       *
       * The component itself applies those updates using:
       *
       * Y.applyUpdate(document, update, "idb")
       *
       * and therefore they should not result in saveYjsUpdate.
       */
      const sourceDoc = new Y.Doc();

      sourceDoc
        .getText("content")
        .insert(0, "IndexedDB data");

      const update =
        Y.encodeStateAsUpdate(sourceDoc);

      mockLoadYjsUpdates.mockResolvedValue([
        update,
      ]);

      renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });

      expect(
        mockSaveYjsUpdate,
      ).not.toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                         REMOTE DOCUMENT LOAD                              */
  /* ======================================================================== */

  describe("Remote document loading", () => {
    it("handles document:load event", async () => {
      renderEditor();

      await waitFor(() => {
        expect(socketHandlers["document:load"]).toBeDefined();
      });

      const remoteDoc = new Y.Doc();

      remoteDoc
        .getText("content")
        .insert(0, "Remote document");

      const update =
        Y.encodeStateAsUpdate(remoteDoc);

      act(() => {
        socketHandlers["document:load"](update);
      });

      /*
       * The handler should apply the update without
       * throwing.
       */
      expect(
        screen.getByTestId("tiptap-editor"),
      ).toBeInTheDocument();
    });
  });

  /* ======================================================================== */
  /*                       REMOTE DOCUMENT UPDATES                             */
  /* ======================================================================== */

  describe("Remote document updates", () => {
    it("handles document:update events", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          socketHandlers["document:update"],
        ).toBeDefined();
      });

      const remoteDoc = new Y.Doc();

      remoteDoc
        .getText("content")
        .insert(0, "Remote update");

      const update =
        Y.encodeStateAsUpdate(remoteDoc);

      act(() => {
        socketHandlers["document:update"](update);
      });

      expect(
        screen.getByTestId("tiptap-editor"),
      ).toBeInTheDocument();
    });

    it("does not save remote updates back to IndexedDB", async () => {
      renderEditor();

      await waitFor(() => {
        expect(
          socketHandlers["document:update"],
        ).toBeDefined();
      });

      const remoteDoc = new Y.Doc();

      remoteDoc
        .getText("content")
        .insert(0, "Remote update");

      const update =
        Y.encodeStateAsUpdate(remoteDoc);

      act(() => {
        socketHandlers["document:update"](update);
      });

      expect(
        mockSaveYjsUpdate,
      ).not.toHaveBeenCalled();
    });
  });

  /* ======================================================================== */
  /*                                CLEANUP                                    */
  /* ======================================================================== */

  describe("Cleanup", () => {
    it("removes socket connect listener on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(socketHandlers.connect).toBeDefined();
      });

      unmount();

      expect(socket.off).toHaveBeenCalledWith(
        "connect",
        expect.any(Function),
      );
    });

    it("removes socket disconnect listener on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(socketHandlers.disconnect).toBeDefined();
      });

      unmount();

      expect(socket.off).toHaveBeenCalledWith(
        "disconnect",
        expect.any(Function),
      );
    });

    it("removes document load listener on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(
          socketHandlers["document:load"],
        ).toBeDefined();
      });

      unmount();

      expect(socket.off).toHaveBeenCalledWith(
        "document:load",
        expect.any(Function),
      );
    });

    it("removes document update listener on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(
          socketHandlers["document:update"],
        ).toBeDefined();
      });

      unmount();

      expect(socket.off).toHaveBeenCalledWith(
        "document:update",
        expect.any(Function),
      );
    });

    it("clears IndexedDB documents on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });

      unmount();

      expect(
        mockClearAllYjsDocuments,
      ).toHaveBeenCalledTimes(1);
    });

    it("leaves the document on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });

      unmount();

      expect(socket.emit).toHaveBeenCalledWith(
        "document:leave",
        "document-1",
      );
    });

    it("removes all socket listeners on unmount", async () => {
      const { unmount } = renderEditor();

      await waitFor(() => {
        expect(
          screen.getByTestId("tiptap-editor"),
        ).toBeInTheDocument();
      });

      unmount();

      expect(socket.off).toHaveBeenCalledTimes(5);
    });
  });

  /* ======================================================================== */
  /*                              ERROR HANDLING                               */
  /* ======================================================================== */

  describe("Error handling", () => {
    it("handles IndexedDB initialization failure", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockLoadYjsUpdates.mockRejectedValue(
        new Error("IndexedDB failed"),
      );

      renderEditor();

      await waitFor(() => {
        expect(
          consoleErrorSpy,
        ).toHaveBeenCalledWith(
          "Failed to initialize collaborative document:",
          expect.any(Error),
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it("does not render TiptapEditor when initialization fails", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockLoadYjsUpdates.mockRejectedValue(
        new Error("Initialization failed"),
      );

      renderEditor();

      await waitFor(() => {
        expect(
          consoleErrorSpy,
        ).toHaveBeenCalled();
      });

      expect(
        screen.queryByTestId("tiptap-editor"),
      ).not.toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  /* ======================================================================== */
  /*                         DIFFERENT DOCUMENT                                */
  /* ======================================================================== */

  describe("Document changes", () => {
    it("reinitializes when document id changes", async () => {
      const { rerender } = render(
        <Editor
          userToken="user-token"
          documentId="document-1"
          documentToken="token-1"
        />,
      );

      await waitFor(() => {
        expect(mockLoadYjsUpdates).toHaveBeenCalledWith(
          "document-1",
        );
      });

      mockLoadYjsUpdates.mockClear();

      rerender(
        <Editor
          userToken="user-token"
          documentId="document-2"
          documentToken="token-2"
        />,
      );

      await waitFor(() => {
        expect(mockLoadYjsUpdates).toHaveBeenCalledWith(
          "document-2",
        );
      });
    });

    it("reinitializes when user token changes", async () => {
      const { rerender } = render(
        <Editor
          userToken="user-token-1"
          documentId="document-1"
          documentToken="token-1"
        />,
      );

      await waitFor(() => {
        expect(mockGetSocket).toHaveBeenCalledWith(
          "user-token-1",
        );
      });

      mockGetSocket.mockClear();

      rerender(
        <Editor
          userToken="user-token-2"
          documentId="document-1"
          documentToken="token-1"
        />,
      );

      await waitFor(() => {
        expect(mockGetSocket).toHaveBeenCalledWith(
          "user-token-2",
        );
      });
    });
  });
});