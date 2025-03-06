
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

// API base URL - using relative URL to respect host origin
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Database schema
interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  createdAt: Date;
  expiresAt: Date | null;
  isOpen: boolean;
}

interface Vote {
  id: string;
  pollId: string;
  voterName: string;
  voterEmail: string | null;
  rankings: string[]; // Array of option IDs in ranked order
  createdAt: Date;
}

// Initialize DB is now a mock function for API compatibility
export const initDB = async (): Promise<boolean> => {
  try {
    console.log(`Connecting to API at ${API_BASE_URL}`);
    // Test API connection
    const response = await fetch(`${API_BASE_URL}/polls?limit=1`);
    console.log(`API connection response:`, response);
    return response.ok;
  } catch (error) {
    console.error("Error connecting to API:", error);
    return false;
  }
};

// Poll CRUD operations
export const createPoll = async (poll: Omit<Poll, "id" | "createdAt">): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(poll),
    });

    if (!response.ok) {
      throw new Error("Failed to create poll");
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to get poll");
    }

    const poll = await response.json();
    
    // Convert date strings to Date objects
    return {
      ...poll,
      createdAt: new Date(poll.createdAt),
      expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
    };
  } catch (error) {
    console.error("Error getting poll:", error);
    throw error;
  }
};

export const updatePoll = async (poll: Poll): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${poll.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(poll),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};

export const closePoll = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${id}/close`, {
      method: "PUT",
    });

    return response.ok;
  } catch (error) {
    console.error("Error closing poll:", error);
    throw error;
  }
};

export const deletePoll = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting poll:", error);
    throw error;
  }
};

export const getAllPolls = async (): Promise<Poll[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls`);

    if (!response.ok) {
      throw new Error("Failed to get polls");
    }

    const polls = await response.json();
    
    // Convert date strings to Date objects
    return polls.map((poll: any) => ({
      ...poll,
      createdAt: new Date(poll.createdAt),
      expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
    }));
  } catch (error) {
    console.error("Error getting polls:", error);
    throw error;
  }
};

// Vote CRUD operations
export const submitVote = async (vote: Omit<Vote, "id" | "createdAt">): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/votes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vote),
    });

    if (!response.ok) {
      throw new Error("Failed to submit vote");
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
};

export const getVotesForPoll = async (pollId: string): Promise<Vote[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/votes`);

    if (!response.ok) {
      throw new Error("Failed to get votes");
    }

    const votes = await response.json();
    
    // Convert date strings to Date objects
    return votes.map((vote: any) => ({
      ...vote,
      createdAt: new Date(vote.createdAt),
    }));
  } catch (error) {
    console.error("Error getting votes:", error);
    throw error;
  }
};

export const hasVoted = async (pollId: string, voterEmail: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/hasVoted?email=${encodeURIComponent(voterEmail)}`);

    if (!response.ok) {
      throw new Error("Failed to check if voter has voted");
    }

    const data = await response.json();
    return data.hasVoted;
  } catch (error) {
    console.error("Error checking if voter has voted:", error);
    throw error;
  }
};

// Utility functions
export const computeResults = async (pollId: string): Promise<{
  rankings: Array<{ option: string; score: number }>;
  totalVotes: number;
  statistics: {
    firstChoiceDistribution: Record<string, number>;
    eliminationRounds: Array<{
      round: number;
      eliminated: string;
      scores: Record<string, number>;
    }>;
  };
}> => {
  try {
    const poll = await getPoll(pollId);
    if (!poll) throw new Error("Poll not found");

    const votes = await getVotesForPoll(pollId);
    if (votes.length === 0) {
      return {
        rankings: poll.options.map(option => ({ option, score: 0 })),
        totalVotes: 0,
        statistics: {
          firstChoiceDistribution: Object.fromEntries(poll.options.map(option => [option, 0])),
          eliminationRounds: []
        }
      };
    }

    // Compute first choice distribution
    const firstChoiceDistribution: Record<string, number> = {};
    for (const option of poll.options) {
      firstChoiceDistribution[option] = 0;
    }

    for (const vote of votes) {
      const firstChoice = vote.rankings[0];
      if (firstChoice) {
        firstChoiceDistribution[firstChoice] = (firstChoiceDistribution[firstChoice] || 0) + 1;
      }
    }

    // Implement Instant Runoff Voting (IRV) algorithm
    let remainingOptions = [...poll.options];
    let currentVotes = [...votes];
    const eliminationRounds: Array<{
      round: number;
      eliminated: string;
      scores: Record<string, number>;
    }> = [];

    while (remainingOptions.length > 1) {
      // Count first choices
      const scores: Record<string, number> = {};
      for (const option of remainingOptions) {
        scores[option] = 0;
      }

      for (const vote of currentVotes) {
        // Find the first choice that's still in the running
        const validChoice = vote.rankings.find(option => remainingOptions.includes(option));
        if (validChoice) {
          scores[validChoice] = (scores[validChoice] || 0) + 1;
        }
      }

      // Find option with lowest score
      let minScore = Infinity;
      let optionToEliminate = "";

      for (const option of remainingOptions) {
        if (scores[option] < minScore) {
          minScore = scores[option];
          optionToEliminate = option;
        }
      }

      // Record this elimination round
      eliminationRounds.push({
        round: poll.options.length - remainingOptions.length + 1,
        eliminated: optionToEliminate,
        scores: { ...scores }
      });

      // Remove the eliminated option
      remainingOptions = remainingOptions.filter(option => option !== optionToEliminate);
    }

    // Compute final rankings
    const finalScores: Record<string, number> = {};
    for (const option of poll.options) {
      // Count how often this option beat other options across all votes
      let score = 0;
      for (const vote of votes) {
        const rank = vote.rankings.indexOf(option);
        if (rank !== -1) {
          // Lower rank is better (0 is best)
          score += (poll.options.length - rank);
        }
      }
      finalScores[option] = score;
    }

    // Sort options by score (highest to lowest)
    const rankings = poll.options
      .map(option => ({ option, score: finalScores[option] }))
      .sort((a, b) => b.score - a.score);

    return {
      rankings,
      totalVotes: votes.length,
      statistics: {
        firstChoiceDistribution,
        eliminationRounds
      }
    };
  } catch (error) {
    console.error("Error computing results:", error);
    throw error;
  }
};

// Update the useDatabase hook to include initialized property
export const useDatabase = () => {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  
  const initialize = async () => {
    if (initializing) return false;
    
    try {
      setInitializing(true);
      console.log("Attempting to initialize database connection");
      const success = await initDB();
      console.log("Database initialization result:", success);
      setInitialized(success);
      setInitializing(false);
      
      if (!success) {
        toast({
          title: "API Connection Error",
          description: "Failed to connect to the server API. Please make sure the backend server is running.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
      toast({
        title: "API Connection Error",
        description: "Failed to connect to the server API. Some features may not work correctly.",
        variant: "destructive",
      });
      setInitializing(false);
      return false;
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return { initialize, initialized, initializing };
};

// Export types
export type { Poll, Vote };
