"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type Message = { type: string; data?: unknown };
type Handler = (type: string, data: unknown) => void;

function getSocketUrl() {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  return `${window.location.protocol}//${window.location.hostname}:4000`;
}

/**
 * Joins `room` on the relay (socket-server.mjs).
 * `send(type, data)` forwards a message to every other device in the same room.
 * `onMessage(type, data)` is called for every message another device sent.
 */
export function useSocket(room: string, onMessage?: Handler) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const handlerRef = useRef<Handler | undefined>(onMessage);

  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const socket = io(getSocketUrl());
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", room);
      setConnected(true);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("message", (message: Message) => {
      handlerRef.current?.(message.type, message.data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room]);

  const send = useCallback((type: string, data?: unknown) => {
    socketRef.current?.emit("message", { type, data });
  }, []);

  return { send, connected };
}
