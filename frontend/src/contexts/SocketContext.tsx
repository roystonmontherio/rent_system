import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

// ============================================
// 🔄 Environment Switch
// VITE_SOCKET_URL is set in frontend/.env
// Local:      http://localhost:5000
// Production: https://rent-system-backend-nfky.onrender.com
// ============================================
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to WebSocket');
        setConnected(true);
        // Join private user room for notifications
        newSocket.emit('join_user_room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
      setConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
