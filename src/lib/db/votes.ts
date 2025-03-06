
import { API_BASE_URL } from './config';
import type { Vote } from './types';

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
