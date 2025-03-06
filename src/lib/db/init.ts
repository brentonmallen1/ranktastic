
// Database initialization

const DB_NAME = "rankchoice_db";
const DB_VERSION = 1;

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

// Get database instance
export const getDB = (): IDBDatabase | null => {
  return db;
};
