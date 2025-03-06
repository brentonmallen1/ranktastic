
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { initDB } from "./init";
import { API_BASE_URL } from "./config";

// Update the useDatabase hook to include better error handling and prevent continuous API calls
export const useDatabase = () => {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;
  const initAttempted = useRef(false);
  
  const initialize = async () => {
    // Prevent multiple initialization attempts
    if (initializing || initAttempted.current) return false;
    
    try {
      setInitializing(true);
      initAttempted.current = true;
      setInitializationError(null);
      console.log("Attempting to initialize database connection");
      console.log(`API URL from env: ${import.meta.env.VITE_API_URL}`);
      console.log(`Using API URL: ${API_BASE_URL}`);
      
      const success = await initDB();
      console.log("Database initialization result:", success);
      
      if (success) {
        setInitialized(true);
        setInitializing(false);
        return true;
      } else {
        const errorMsg = "Failed to connect to the server API. Please try again.";
        setInitializationError(errorMsg);
        setInitialized(false);
        
        // Only show toast error on first failure 
        if (retries === 0) {
          toast({
            title: "API Connection Error",
            description: errorMsg,
            variant: "destructive",
          });
        }
        
        // Increment retry counter but don't automatically retry
        setRetries(retries + 1);
        setInitializing(false);
        return false;
      }
    } catch (error) {
      const errorMsg = `Failed to connect to the server API: ${error.message}`;
      console.error(errorMsg, error);
      setInitializationError(errorMsg);
      setInitialized(false);
      
      if (retries === 0) {
        toast({
          title: "API Connection Error",
          description: "Failed to connect to the server API. Please try again later.",
          variant: "destructive",
        });
      }
      
      setInitializing(false);
      return false;
    }
  };

  // Only attempt initialization once on component mount
  useEffect(() => {
    if (!initAttempted.current) {
      initialize();
    }
  }, []);

  return { 
    initialize, 
    initialized, 
    initializing,
    initializationError,
    retry: () => {
      initAttempted.current = false;
      setRetries(0);
      return initialize();
    }
  };
};
