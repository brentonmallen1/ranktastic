import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { AppSettings } from '../types';

export interface AdminStats {
  total_polls: number;
  open_polls: number;
  total_votes: number;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/stats'),
  });
}

export function useAppSettings() {
  return useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/admin/settings'),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppSettings>) => api.put('/admin/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}

export function useSubscribeNotification() {
  return useMutation({
    mutationFn: (data: { poll_id: string; email: string }) =>
      api.post('/notifications/subscribe', data),
  });
}
