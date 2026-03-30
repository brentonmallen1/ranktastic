import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Vote, VoterStatus } from '../types';

export interface SubmitVoteData {
  poll_id: string;
  voter_name?: string | null;
  voter_email: string;
  rankings: string[];
}

export function useSubmitVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitVoteData) => api.post<Vote>('/votes', data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['poll', vars.poll_id] });
      qc.invalidateQueries({ queryKey: ['results', vars.poll_id] });
      qc.invalidateQueries({ queryKey: ['voterStatus', vars.poll_id, vars.voter_email] });
    },
  });
}

export function useVoterStatus(pollId: string, email: string) {
  return useQuery<VoterStatus>({
    queryKey: ['voterStatus', pollId, email],
    queryFn: () => api.get(`/votes/status?poll_id=${encodeURIComponent(pollId)}&email=${encodeURIComponent(email)}`),
    enabled: !!pollId && !!email,
    retry: false,
  });
}

export function useVerifyVote() {
  return useMutation({
    mutationFn: (token: string) => api.post<{ message: string; poll_id?: string }>(`/votes/verify?token=${encodeURIComponent(token)}`),
  });
}

export function usePollVotes(pollId: string, enabled = true) {
  return useQuery<Vote[]>({
    queryKey: ['pollVotes', pollId],
    queryFn: () => api.get(`/votes/poll/${encodeURIComponent(pollId)}`),
    enabled: enabled && !!pollId,
  });
}
