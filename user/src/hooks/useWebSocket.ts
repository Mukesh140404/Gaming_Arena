import { useCallback, useEffect, useRef, useState } from "react";

export const useWebSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);

  const [connectionId, setConnectionId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isGameStarted,setIsGameStarted]=useState(false);
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000");

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "connection-id":
          setConnectionId(data.connectionId);
          break;

        case "room-created":
          break;
        case "room-joined":
          setRoomId(data.roomId);
          break;
        case "room-game-started":
          setIsGameStarted(true);
          break;
      }

      if (data.message) {
        if (data.roomChat === true) {
          setRoomMessages((prev) => [...prev, data]);
        } else {
          setMessages((prev) => [...prev, data]);
        }
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = useCallback((data: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return {
    isGameStarted,
    connectionId,
    roomId,
    messages,
    roomMessages,
    connected,
    sendMessage,
    setRoomId,
  };
};