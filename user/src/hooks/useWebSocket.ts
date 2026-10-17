import { useCallback, useEffect, useState } from "react";

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

// -------------------------------------------------------------
// SINGLETON SHARED WEBSOCKET STATE (Shared across all components)
// -------------------------------------------------------------
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

type Subscriber = () => void;
const subscribers = new Set<Subscriber>();

function notifySubscribers() {
  subscribers.forEach((sub) => sub());
}

function initSharedSocket() {
  if (
    sharedSocket &&
    (sharedSocket.readyState === WebSocket.OPEN ||
      sharedSocket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000";

  const socket = new WebSocket(WS_URL);
  sharedSocket = socket;

  socket.onopen = () => {
    sharedConnected = true;
    console.log("WebSocket connected (singleton)");
    notifySubscribers();
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
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
          sharedGameError = null;
          break;

        case "game-state":
          sharedGameState = data.state;
          break;

        case "game-ended":
          sharedGameResult = data.result;
          // sharedIsGameStarted = false;
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
    console.log("WebSocket disconnected (singleton)");
    notifySubscribers();
  };
}

export const useWebSocket = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    initSharedSocket();

    const handleUpdate = () => {
      setTick((prev) => prev + 1);
    };

    subscribers.add(handleUpdate);

    return () => {
      subscribers.delete(handleUpdate);
    };
  }, []);

  const sendMessage = useCallback((data: object) => {
    if (sharedSocket?.readyState === WebSocket.OPEN) {
      sharedSocket.send(JSON.stringify(data));
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
    // Server linked functions
    joinRoom,
    leaveRoom,
    startGame,
    sendGameAction,
    sendRoomChat,
    sendBroadcastMessage,
  };
};
