
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { initDB } from "./init";

// Database initialization hook
export const useDatabase = () => {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  
  const initialize = async () => {
    try {
      const success = await initDB();
      setInitialized(success);
      return success;
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
