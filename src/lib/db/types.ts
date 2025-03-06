
// Database schema types
export interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  createdAt: Date;
  expiresAt: Date | null;
  isOpen: boolean;
}

export interface Vote {
  id: string;
  pollId: string;
  voterName: string;
  voterEmail: string | null;
  rankings: string[]; // Array of option IDs in ranked order
  createdAt: Date;
}
