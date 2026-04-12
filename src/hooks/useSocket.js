import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) return;

    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      auth: { token },
    });

    socketInstance.on('connect', () => {
      console.log('✅ Conectado al servidor de sockets');
      setIsConnected(true);
      socketInstance.emit('register', user._id);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado del servidor de sockets');
      setIsConnected(false);
    });

    socketInstance.on('newOrder', (order) => {
      if (user.role === 'mandadito') {
        toast.success(`📦 Nueva orden disponible!`, { duration: 5000 });
      }
    });

    socketInstance.on('orderUpdated', (order) => {
      toast.info(`🔄 Orden #${order._id.slice(-6)} actualizada`, { duration: 3000 });
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, token]);

  return { socket, isConnected };
};