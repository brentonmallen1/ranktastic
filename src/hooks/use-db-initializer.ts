
import { useState, useEffect } from "react";
import { useDatabase, initDB } from "@/lib/db";

export const useDbInitializer = () => {
  const { initialized } = useDatabase();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const manuallyInitDB = async () => {
      if (!initialized && !dbInitialized) {
        console.log("Database not initialized via hook, initializing manually");
        try {
          await initDB();
          setDbInitialized(true);
          console.log("Manual database initialization successful");
        } catch (err) {
          console.error("Failed to manually initialize database:", err);
          setError("Failed to initialize database");
          setLoading(false);
        }
      } else if (initialized) {
        setDbInitialized(true);
      }
    };
    
    manuallyInitDB();
  }, [initialized, dbInitialized]);

  return { initialized, dbInitialized, loading, setLoading, error, setError };
};
