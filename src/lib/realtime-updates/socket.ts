import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketAuthToken: string | undefined;

function socketUrl() {
  console.log(process.env.NEXT_PUBLIC_SOCKET_URL)
  const url = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SOCKET_URL is not configured");
  }
  return url.replace(/\/$/, "");
}

export function getSocket(token: string | undefined) {
  if (!socket) {
    socket = io(socketUrl(), {
      withCredentials: true,
      autoConnect: true,
      // Prefer websocket; fall back to polling if the upgrade fails.
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    });
    socketAuthToken = token;
    return socket;
  }

  // Update auth when the session token changes (e.g. after login in same tab).
  if (token && token !== socketAuthToken) {
    socket.auth = { token };
    socketAuthToken = token;
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  // Prevent auto-reconnect so presence can flip to offline after leaving a document.
  socket.io.opts.reconnection = false;
  socket.disconnect();
  socket = null;
  socketAuthToken = undefined;
}
