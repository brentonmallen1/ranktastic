
import { getDB } from "./init";
import type { Poll } from "./types";

// Poll CRUD operations
export const createPoll = (poll: Omit<Poll, "id" | "createdAt">): Promise<string> => {
  return new Promise((resolve, reject) => {
    const db = getDB();
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
    const db = getDB();
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
    const db = getDB();
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

export const deletePoll = (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const db = getDB();
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
    const db = getDB();
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
