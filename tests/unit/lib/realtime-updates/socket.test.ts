import { io } from "socket.io-client";
import { getSocket } from "@/lib/realtime-updates/socket";

jest.mock("socket.io-client", () => ({
  io: jest.fn(),
}));

describe("getSocket", () => {
  const SOCKET_URL = "http://localhost:8000";

  let mockSocket: {
    connected: boolean;
    connect: jest.Mock;
    disconnect: jest.Mock;
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.NEXT_PUBLIC_SOCKET_URL = SOCKET_URL;

    mockSocket = {
      connected: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };
  });

  const loadSocketModule = async () => {
    const mockIo = jest.fn(() => mockSocket);

    jest.doMock("socket.io-client", () => ({
      io: mockIo,
    }));

    const module = await import(
      "@/lib/realtime-updates/socket"
    );

    return {
      getSocket: module.getSocket,
      mockIo,
    };
  };

  afterEach(() => {
    jest.dontMock("socket.io-client");
    jest.clearAllMocks();
  });

  describe("Socket initialization", () => {
    it("creates a socket when one does not already exist", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      const socket = getSocket("test-token");

      expect(mockIo).toHaveBeenCalledTimes(1);
      expect(socket).toBe(mockSocket);
    });

    it("uses the configured socket URL", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("test-token");

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.any(Object),
      );
    });

    it("enables credentials", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("test-token");

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          withCredentials: true,
        }),
      );
    });

    it("enables autoConnect", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("test-token");

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          autoConnect: true,
        }),
      );
    });

    it("uses websocket transport", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("test-token");

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          transports: ["websocket", "polling"],
        }),
      );
    });
  });

  describe("Authentication", () => {
    it("passes the token through Socket.IO auth", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("test-token");

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          auth: {
            token: "test-token",
          },
        }),
      );
    });

    it("does not provide auth when the token is undefined", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket(undefined);

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          auth: undefined,
        }),
      );
    });

    it("does not provide authentication for an empty token", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("");

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          auth: undefined,
        }),
      );
    });
  });

  describe("Singleton behavior", () => {
    it("returns the same socket instance on subsequent calls", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      const firstSocket = getSocket("token-1");
      const secondSocket = getSocket("token-1");

      expect(firstSocket).toBe(secondSocket);
      expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it("creates the socket only once", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("token-1");
      getSocket("token-1");
      getSocket("token-1");

      expect(mockIo).toHaveBeenCalledTimes(1);
    });

    it("keeps the original socket when a different token is provided", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      const firstSocket = getSocket("token-1");
      const secondSocket = getSocket("token-2");

      expect(secondSocket).toBe(firstSocket);

      expect(mockIo).toHaveBeenCalledTimes(1);

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        expect.objectContaining({
          auth: {
            token: "token-1",
          },
        }),
      );
    });
  });

  describe("Socket configuration", () => {
    it("passes all expected options when authenticated", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket("my-token");

      expect(mockIo).toHaveBeenCalledTimes(1);

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        {
          withCredentials: true,
          autoConnect: true,
          transports: ["websocket", "polling"],
          auth: {
            token: "my-token",
          },
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 500,
        },
      );
    });

    it("passes all expected options when unauthenticated", async () => {
      const { getSocket, mockIo } =
        await loadSocketModule();

      getSocket(undefined);

      expect(mockIo).toHaveBeenCalledTimes(1);

      expect(mockIo).toHaveBeenCalledWith(
        SOCKET_URL,
        {
          withCredentials: true,
          autoConnect: true,
          transports: ["websocket", "polling"],
          auth: undefined,
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 500,
        },
      );
    });
  });

  describe("Returned socket", () => {
    it("returns the mocked Socket.IO instance", async () => {
      const { getSocket } =
        await loadSocketModule();

      const result = getSocket("test-token");

      expect(result).toBe(mockSocket);
    });

    it("returns a socket containing the expected methods", async () => {
      const { getSocket } =
        await loadSocketModule();

      const result = getSocket("test-token");

      expect(result).toEqual(
        expect.objectContaining({
          connected: false,
          connect: expect.any(Function),
          disconnect: expect.any(Function),
          on: expect.any(Function),
          off: expect.any(Function),
          emit: expect.any(Function),
        }),
      );
    });
  });
});