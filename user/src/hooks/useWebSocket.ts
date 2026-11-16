import { useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useAuth";

export interface RoomMessage {
  type?: string;
  message: string;
  connectionId?: string;
  userId?: string;
  name?: string;
  roomId?: string;
  roomChat?: boolean;
  time?: number;
}

let sharedSocket: WebSocket | null = null;
let sharedConnectionId = "";
let sharedRoomId = "";
let sharedConnected = false;
let sharedIsGameStarted = false;
let sharedGameState: any = null;
let sharedGameResult: any = null;
let sharedGameError: string | null = null;
let sharedRoomMessages: RoomMessage[] = [];
let sharedMessages: any[] = [];
let sharedFinalState: any = null;

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();
const pendingMessages: object[] = [];
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isExplicitlyClosed = false;

function notifySubscribers() {
  subscribers.forEach((sub) => sub());
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (sharedSocket?.readyState === WebSocket.OPEN) {
      sharedSocket.send(JSON.stringify({ type: "PING" }));
    }
  }, 25000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function initSharedSocket() {
  if (
    sharedSocket &&
    (sharedSocket.readyState === WebSocket.OPEN ||
      sharedSocket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  // Do not connect until the token is available
  const token = sessionStorage.getItem("wsToken");
  if (!token) return;

  isExplicitlyClosed = false;
  const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000";

  const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
  sharedSocket = socket;

  socket.onopen = () => {
    sharedConnected = true;
    console.log("WebSocket connected...");
    startHeartbeat();

    // Flush any pending messages that were queued while connecting
    while (pendingMessages.length > 0) {
      const msg = pendingMessages.shift();
      if (msg) socket.send(JSON.stringify(msg));
    }

    // If we were already in a room, re-join it on reconnect
    if (sharedRoomId) {
      socket.send(JSON.stringify({ type: "JOIN_ROOM", roomId: sharedRoomId }));
    }

    notifySubscribers();
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "PONG":
          break; // Heartbeat acknowledged

        case "connection-id":
          sharedConnectionId = data.connectionId;
          break;

        case "room-joined":
          sharedRoomId = data.roomId;
          break;

        case "room-game-started":
        case "game-started":
          sharedIsGameStarted = true;
          sharedGameState = data.state ?? null;
          sharedGameResult = null;
          sharedFinalState = null;
          sharedGameError = null;
          break;

        case "game-state":
          sharedIsGameStarted = true; // Auto-restore on reconnect/refresh
          sharedGameState = data.state;
          break;

        case "game-ended":
          sharedGameResult = data.result;
          sharedFinalState = data.finalState ?? null;
          break;

        case "game-error":
          sharedGameError = data.message;
          break;

        case "roomChat":
        case "notify":
          sharedRoomMessages = [...sharedRoomMessages, data];
          break;

        case "message":
          if (data.roomChat === true) {
            sharedRoomMessages = [...sharedRoomMessages, data];
          } else {
            sharedMessages = [...sharedMessages, data];
          }
          break;

        default:
          if (data.message) {
            if (data.roomChat === true) {
              sharedRoomMessages = [...sharedRoomMessages, data];
            } else {
              sharedMessages = [...sharedMessages, data];
            }
          }
          break;
      }

      notifySubscribers();
    } catch {
      // Ignored non-json string message
    }
  };

  socket.onclose = () => {
    sharedConnected = false;
    sharedSocket = null;
    stopHeartbeat();
    console.log("WebSocket disconnected (singleton)");
    notifySubscribers();

    // Auto-reconnect after 2 seconds if not manually closed
    if (!isExplicitlyClosed && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        initSharedSocket();
      }, 2500);
    }
  };
}

export function resetRoomSession() {
  sharedRoomMessages = [];
  sharedGameState = null;
  sharedGameResult = null;
  sharedFinalState = null;
  sharedGameError = null;
  sharedIsGameStarted = false;
  notifySubscribers();
}

// Call this on logout so the next login opens a fresh socket with the new token
export function closeSharedSocket() {
  isExplicitlyClosed = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  stopHeartbeat();
  sharedSocket?.close();
  sharedSocket = null;
  sharedConnected = false;
  sharedConnectionId = "";
  sharedRoomId = "";
  sharedIsGameStarted = false;
  sharedGameState = null;
  sharedGameResult = null;
  sharedFinalState = null;
  sharedGameError = null;
  sharedRoomMessages = [];
  sharedMessages = [];
  notifySubscribers();
}

export const useWebSocket = () => {
  const [, setTick] = useState(0);
  const { data: currentUser } = useCurrentUser();

  // Subscribe to shared state updates
  useEffect(() => {
    const handleUpdate = () => {
      setTick((prev) => prev + 1);
    };

    subscribers.add(handleUpdate);

    return () => {
      subscribers.delete(handleUpdate);
    };
  }, []);

  // Connect only after the current user (and wsToken) is available
  useEffect(() => {
    if (!currentUser) return;
    initSharedSocket();
  }, [currentUser?.id]);

  const sendMessage = useCallback((data: object) => {
    if (sharedSocket?.readyState === WebSocket.OPEN) {
      sharedSocket.send(JSON.stringify(data));
    } else if (sharedSocket?.readyState === WebSocket.CONNECTING) {
      pendingMessages.push(data);
    } else {
      console.warn("WebSocket is not open. Unable to send:", data);
    }
  }, []);

  const joinRoom = useCallback(
    (targetRoomId: string) => {
      sharedRoomId = targetRoomId;
      sendMessage({
        type: "JOIN_ROOM",
        roomId: targetRoomId,
      });
      notifySubscribers();
    },
    [sendMessage],
  );

  const leaveRoom = useCallback(
    (targetRoomId: string) => {
      sendMessage({
        type: "LEAVE_ROOM",
        roomId: targetRoomId,
      });
    },
    [sendMessage],
  );

  const startGame = useCallback(
    (targetRoomId: string) => {
      sendMessage({
        type: "START_GAME",
        roomId: targetRoomId,
      });
    },
    [sendMessage],
  );

  const sendGameAction = useCallback(
    (targetRoomId: string, action: unknown) => {
      sendMessage({
        type: "GAME_ACTION",
        roomId: targetRoomId,
        action,
      });
    },
    [sendMessage],
  );

  const sendRoomChat = useCallback(
    (targetRoomId: string, message: string) => {
      sendMessage({
        type: "ROOM_CHAT",
        roomId: targetRoomId,
        message,
      });
    },
    [sendMessage],
  );

  const sendBroadcastMessage = useCallback(
    (message: string) => {
      sendMessage({
        type: "ROOM_CHAT",
        message,
      });
    },
    [sendMessage],
  );

  const setRoomId = useCallback((id: string) => {
    sharedRoomId = id;
    notifySubscribers();
  }, []);

  const setIsGameStarted = useCallback((val: boolean) => {
    sharedIsGameStarted = val;
    notifySubscribers();
  }, []);

  const setGameState = useCallback((state: any) => {
    sharedGameState = state;
    notifySubscribers();
  }, []);

  const setGameResult = useCallback((result: any) => {
    sharedGameResult = result;
    notifySubscribers();
  }, []);

  const setFinalState = useCallback((state: any) => {
    sharedFinalState = state;
    notifySubscribers();
  }, []);

  return {
    connected: sharedConnected,
    connectionId: sharedConnectionId,
    roomId: sharedRoomId,
    setRoomId,
    isGameStarted: sharedIsGameStarted,
    setIsGameStarted,
    setGameResult,
    gameState: sharedGameState,
    setGameState,
    gameResult: sharedGameResult,
    gameError: sharedGameError,
    roomMessages: sharedRoomMessages,
    messages: sharedMessages,
    sendMessage,
    resetRoomSession,
    finalState: sharedFinalState,
    setFinalState: setFinalState,
    // Server linked functions
    joinRoom,
    leaveRoom,
    startGame,
    sendGameAction,
    sendRoomChat,
    sendBroadcastMessage,
  };
};
