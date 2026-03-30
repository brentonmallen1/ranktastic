import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Poll, PollOption, PollResults } from '../types';

export interface CreatePollData {
  title: string;
  description: string;
  options: PollOption[];
  expires_at?: string | null;
  is_private?: boolean;
  invited_emails?: string[];
  require_email_verification?: boolean;
  allow_vote_editing?: boolean;
  randomize_options?: boolean;
}

export interface UpdatePollData {
  title?: string;
  description?: string;
  options?: PollOption[];
  expires_at?: string | null;
  is_private?: boolean;
  invited_emails?: string[];
  require_email_verification?: boolean;
  allow_vote_editing?: boolean;
  randomize_options?: boolean;
}

export function usePolls() {
  return useQuery<Poll[]>({
    queryKey: ['polls'],
    queryFn: () => api.get('/polls'),
  });
}

export function usePoll(id: string) {
  return useQuery<Poll>({
    queryKey: ['poll', id],
    queryFn: () => api.get(`/polls/${id}`),
    enabled: !!id,
  });
}

export function usePollResults(id: string) {
  return useQuery<PollResults>({
    queryKey: ['results', id],
    queryFn: () => api.get(`/polls/${id}/results`),
    enabled: !!id,
  });
}

export function useCreatePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePollData) => api.post<Poll>('/polls', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls'] }),
  });
}

export function useUpdatePoll(pollId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePollData) => api.put<Poll>(`/polls/${pollId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['polls'] });
      qc.invalidateQueries({ queryKey: ['poll', pollId] });
    },
  });
}

export function useClosePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => api.put<Poll>(`/polls/${pollId}/close`),
    onSuccess: (_data, pollId) => {
      qc.invalidateQueries({ queryKey: ['polls'] });
      qc.invalidateQueries({ queryKey: ['poll', pollId] });
      qc.invalidateQueries({ queryKey: ['results', pollId] });
    },
  });
}

export function useReopenPoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => api.put<Poll>(`/polls/${pollId}/reopen`),
    onSuccess: (_data, pollId) => {
      qc.invalidateQueries({ queryKey: ['polls'] });
      qc.invalidateQueries({ queryKey: ['poll', pollId] });
    },
  });
}

export function useDeletePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => api.delete(`/polls/${pollId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls'] }),
  });
}

export function useClearVotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => api.delete(`/polls/${pollId}/votes`),
    onSuccess: (_data, pollId) => {
      qc.invalidateQueries({ queryKey: ['poll', pollId] });
      qc.invalidateQueries({ queryKey: ['results', pollId] });
    },
  });
}

export function useClonePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pollId: string) => api.post<Poll>(`/polls/${pollId}/clone`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls'] }),
  });
}
