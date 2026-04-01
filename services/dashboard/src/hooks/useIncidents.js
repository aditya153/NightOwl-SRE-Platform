import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export const useIncidentsList = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const response = await api.get('/incidents');
      return response.data.incidents; // Revert back to returning incidents array
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

export const useAcknowledgeIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.put(`/incidents/${id}`, { status: 'Investigating' });
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useAuthorizeFix = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/incidents/${id}/fix`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};
