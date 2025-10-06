'use client';

import { useEffect, useState, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

interface UseWebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<WebSocketMessage[]>([]);

  const connect = () => {
    try {
      if (typeof window === 'undefined') return;

      const socketInstance = (window as any).io?.({
        path: '/api/socketio',
        timeout: 20000,
        forceNew: true
      });

      if (!socketInstance) {
        console.warn('Socket.IO not available');
        return;
      }

      socketInstance.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
        
        // Send queued messages
        while (messageQueue.current.length > 0) {
          const queuedMessage = messageQueue.current.shift();
          socketInstance.emit('message', queuedMessage);
        }
      });

      socketInstance.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          const timeout = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
          
          reconnectTimeoutRef.current = timeout;
        }
      });

      socketInstance.on('connect_error', (err: Error) => {
        console.error('WebSocket connection error:', err);
        setError(err.message);
        setIsConnected(false);
      });

      socketInstance.on('message', (message: WebSocketMessage) => {
        setLastMessage(message);
      });

      setSocket(socketInstance);

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to WebSocket');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && isConnected) {
      socket.emit('message', message);
    } else {
      // Queue message for when connection is restored
      messageQueue.current.push(message);
      console.warn('WebSocket not connected, message queued');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    error,
    reconnectAttempts,
    sendMessage,
    connect,
    disconnect
  };
};