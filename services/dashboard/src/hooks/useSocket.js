import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const socket = io('http://localhost:3000');

export const useSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to real-time incident engine');
    });

    socket.on('new-incident', (data) => {
      console.log('Real-time alert received from Event Dispatcher:', data);
      
      // Task 3: Trigger real-time dashboard update by invalidating the React Query cache
      console.log('Synchronizing Dashboard state with Agent Gateway...');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    });

    return () => {
      socket.off('connect');
      socket.off('new-incident');
    };
  }, [queryClient]);

  return socket;
};
