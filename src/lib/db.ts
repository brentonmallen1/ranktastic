import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

// SQLite is used through IndexedDB as a client-side storage solution
const DB_NAME = "rankchoice_db";
const DB_VERSION = 1;

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

let db: IDBDatabase | null = null;

// Initialize the database
export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Error opening database:", event);
      reject(false);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log("Database opened successfully");
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create polls store
      if (!db.objectStoreNames.contains("polls")) {
        const pollsStore = db.createObjectStore("polls", { keyPath: "id" });
        pollsStore.createIndex("createdAt", "createdAt", { unique: false });
        pollsStore.createIndex("isOpen", "isOpen", { unique: false });
      }

      // Create votes store
      if (!db.objectStoreNames.contains("votes")) {
        const votesStore = db.createObjectStore("votes", { keyPath: "id" });
        votesStore.createIndex("pollId", "pollId", { unique: false });
        votesStore.createIndex("voterEmail", "voterEmail", { unique: false });
      }
    };
  });
};

// Poll CRUD operations
export const createPoll = (poll: Omit<Poll, "id" | "createdAt">): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["polls"], "readwrite");
    const store = transaction.objectStore("polls");
    const id = crypto.randomUUID();
    
    const newPoll = {
      ...poll,
      id,
      createdAt: new Date(),
    };

    const request = store.add(newPoll);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = () => {
      reject(new Error("Failed to create poll"));
    };
  });
};

export const getPoll = (id: string): Promise<Poll | null> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["polls"], "readonly");
    const store = transaction.objectStore("polls");
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error("Failed to get poll"));
    };
  });
};

export const updatePoll = (poll: Poll): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["polls"], "readwrite");
    const store = transaction.objectStore("polls");
    const request = store.put(poll);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(new Error("Failed to update poll"));
    };
  });
};

export const closePoll = (id: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const poll = await getPoll(id);
      if (!poll) {
        reject(new Error("Poll not found"));
        return;
      }

      poll.isOpen = false;
      await updatePoll(poll);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

// Add the missing deletePoll function
export const deletePoll = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["polls"], "readwrite");
    const store = transaction.objectStore("polls");
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(new Error("Failed to delete poll"));
    };
  });
};

export const getAllPolls = (): Promise<Poll[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["polls"], "readonly");
    const store = transaction.objectStore("polls");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error("Failed to get polls"));
    };
  });
};

// Vote CRUD operations
export const submitVote = (vote: Omit<Vote, "id" | "createdAt">): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["votes"], "readwrite");
    const store = transaction.objectStore("votes");
    const id = crypto.randomUUID();
    
    const newVote = {
      ...vote,
      id,
      createdAt: new Date(),
    };

    const request = store.add(newVote);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = () => {
      reject(new Error("Failed to submit vote"));
    };
  });
};

export const getVotesForPoll = (pollId: string): Promise<Vote[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["votes"], "readonly");
    const store = transaction.objectStore("votes");
    const index = store.index("pollId");
    const request = index.getAll(pollId);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error("Failed to get votes"));
    };
  });
};

export const hasVoted = (pollId: string, voterEmail: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("Database not initialized"));
      return;
    }

    const transaction = db.transaction(["votes"], "readonly");
    const store = transaction.objectStore("votes");
    const index = store.index("pollId");
    const request = index.getAll(pollId);

    request.onsuccess = () => {
      const votes = request.result as Vote[];
      const hasVoted = votes.some(vote => vote.voterEmail === voterEmail);
      resolve(hasVoted);
    };

    request.onerror = () => {
      reject(new Error("Failed to check if voter has voted"));
    };
  });
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
  
  const initialize = async () => {
    try {
      await initDB();
      setInitialized(true);
      return true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      toast({
        title: "Database Error",
        description: "Failed to initialize local database. Some features may not work correctly.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return { initialize, initialized };
};

// Export types
export type { Poll, Vote };
