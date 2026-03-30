export interface PollOption {
  name: string;
  description?: string | null;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  created_at: string;
  expires_at: string | null;
  is_open: boolean;
  vote_count: number;
  is_private: boolean;
  invited_emails: string[];
  require_email_verification: boolean;
  allow_vote_editing: boolean;
  randomize_options: boolean;
}

export interface Vote {
  id: string;
  poll_id: string;
  voter_name: string | null;
  voter_email: string;
  rankings: string[];
  created_at: string;
  updated_at: string | null;
  is_verified: boolean;
}

export interface VoterStatus {
  has_voted: boolean;
  vote: Vote | null;
}

export interface RankingEntry {
  option: string;
  score: number;
}

export interface VoteTransfer {
  from_option: string;
  to_option: string;
  count: number;
}

export interface EliminationRound {
  round: number;
  eliminated: string;
  scores: Record<string, number>;
  transfers: VoteTransfer[];
}

export interface PollResults {
  poll_id: string;
  rankings: RankingEntry[];
  total_votes: number;
  winner: string | null;
  first_choice_distribution: Record<string, number>;
  elimination_rounds: EliminationRound[];
}

export interface User {
  id: string;
  username: string;
  is_active: boolean;
}

export interface AppSettings {
  allow_public_polls: string;
}
