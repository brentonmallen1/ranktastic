
import { getDB } from "./init";
import type { Vote } from "./types";

// Vote CRUD operations
export const submitVote = (vote: Omit<Vote, "id" | "createdAt">): Promise<string> => {
  return new Promise((resolve, reject) => {
    const db = getDB();
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
    const db = getDB();
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
    const db = getDB();
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
