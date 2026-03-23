import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export const useIncidentsList = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await api.get('/incidents');
      return response.data.incidents;
    },
  });
};

export const useIncidentDetails = (id) => {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
