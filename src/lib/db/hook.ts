
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { initDB } from "./init";
import { API_BASE_URL } from "./config";

// Update the useDatabase hook to include better error handling
export const useDatabase = () => {
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;
  
  const initialize = async () => {
    if (initializing) return false;
    
    try {
      setInitializing(true);
      setInitializationError(null);
      console.log("Attempting to initialize database connection");
      console.log(`API URL from env: ${import.meta.env.VITE_API_URL}`);
      console.log(`Using API URL: ${API_BASE_URL}`);
      
      // Output environment info for debugging
      console.log("Environment information:");
      console.log(`- Base URL: ${window.location.origin}`);
      console.log(`- Current pathname: ${window.location.pathname}`);
      console.log(`- Retries: ${retries}/${MAX_RETRIES}`);
      
      // First try a basic fetch to see if we can reach the API at all
      try {
        console.log("Testing basic API connectivity...");
        const basicResponse = await fetch(`${API_BASE_URL}/`);
        console.log(`Basic API response status: ${basicResponse.status}`);
        const responseText = await basicResponse.text();
        console.log(`Basic API response text: ${responseText.substring(0, 100)}...`);
        
        // Check if we're getting HTML instead of API response
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
          console.warn('Basic API endpoint is returning HTML instead of API data. This indicates a routing issue in the server.');
          console.warn('Make sure your NGINX config is routing /api to the correct backend service.');
        }
      } catch (err) {
        console.error("Error with basic API fetch:", err);
        setInitializationError(`Basic API connectivity failed: ${err.message}`);
      }
      
      const success = await initDB();
      console.log("Database initialization result:", success);
      
      if (success) {
        setInitialized(true);
        setInitializing(false);
        return true;
      } else {
        const errorMsg = "Failed to connect to the server API. Please try refreshing the page or check that the backend is running.";
        setInitializationError(errorMsg);
        setInitialized(false);
        
        // Only show toast error on first failure or every third retry
        if (retries === 0 || retries % 3 === 0) {
          toast({
            title: "API Connection Error",
            description: errorMsg,
            variant: "destructive",
          });
        }
        
        // Increment retry counter and try again if under max retries
        if (retries < MAX_RETRIES) {
          setRetries(retries + 1);
          console.log(`Retrying API connection (${retries + 1}/${MAX_RETRIES})...`);
          setTimeout(() => {
            setInitializing(false);
            initialize();
          }, 3000); // Wait 3 seconds before retrying
        } else {
          console.error(`Max retries (${MAX_RETRIES}) reached. Giving up on API connection.`);
          setInitializing(false);
        }
        
        return false;
      }
    } catch (error) {
      const errorMsg = `Failed to connect to the server API: ${error.message}`;
      console.error(errorMsg, error);
      setInitializationError(errorMsg);
      setInitialized(false);
      
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

  return { 
    initialize, 
    initialized, 
    initializing,
    initializationError,
    retry: () => {
      setRetries(0);
      return initialize();
    }
  };
};
