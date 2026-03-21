import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useTabStore from '../store/tabStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useSocket = () => {
  const token = useAuthStore((state) => state.token);
  const { addTab, updateTab, removeTab } = useTabStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket.io connected');
    });

    socket.on('tab:created', (tabData) => {
      addTab(tabData);
    });

    socket.on('tab:updated', (tabData) => {
      updateTab(tabData._id, tabData);
    });

    socket.on('tab:deleted', ({ tabId }) => {
      // Backend emits { tabId: mongoId } — store.removeTab filters by tab._id
      removeTab(tabId);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, addTab, updateTab, removeTab]);

  return socketRef.current;
};

export default useSocket;
