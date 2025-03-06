
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
      
      // First try a basic fetch to see if we can reach the API at all
      try {
        console.log("Testing basic API connectivity...");
        const basicResponse = await fetch(`${API_BASE_URL}/`);
        console.log(`Basic API response status: ${basicResponse.status}`);
        const responseText = await basicResponse.text();
        console.log(`Basic API response text: ${responseText.substring(0, 100)}...`);
        
        // Test API routes listing
        try {
          console.log("Testing API routes listing...");
          const routesResponse = await fetch(`${API_BASE_URL}/`);
          if (routesResponse.ok) {
            const routesData = await routesResponse.json();
            console.log("Available API routes:", routesData);
          } else {
            console.log(`Routes listing failed: ${routesResponse.status}`);
          }
        } catch (routesError) {
          console.error("Error with API routes listing:", routesError);
        }
        
      } catch (err) {
        console.error("Error with basic API fetch:", err);
        setInitializationError(`Basic API connectivity failed: ${err.message}`);
      }
      
      const success = await initDB();
      console.log("Database initialization result:", success);
      setInitialized(success);
      setInitializing(false);
      
      if (!success) {
        const errorMsg = "Failed to connect to the server API. Please try refreshing the page or check that the backend is running.";
        setInitializationError(errorMsg);
        toast({
          title: "API Connection Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      const errorMsg = `Failed to connect to the server API: ${error.message}`;
      console.error(errorMsg, error);
      setInitializationError(errorMsg);
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
    initializationError
  };
};
