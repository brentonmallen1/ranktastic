
import { API_BASE_URL } from './config';

// Initialize DB is now a mock function for API compatibility
export const initDB = async (): Promise<boolean> => {
  try {
    console.log(`Connecting to API at ${API_BASE_URL}`);
    
    // Test initial connection to base API endpoint
    try {
      const baseResponse = await fetch(`${API_BASE_URL}/`);
      console.log(`Base API response status: ${baseResponse.status}`);
      
      if (baseResponse.ok) {
        const baseData = await baseResponse.text();
        console.log(`Base API response: ${baseData.substring(0, 100)}...`);
      } else {
        console.error(`Base API request failed with status: ${baseResponse.status}`);
      }
    } catch (baseError) {
      console.error("Error connecting to base API:", baseError);
    }
    
    // Test API health check endpoint
    const response = await fetch(`${API_BASE_URL}/health`);
    
    console.log(`API health check response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`API health check failed with status: ${response.status}`);
      try {
        const errorText = await response.text();
        console.error(`Error response body:`, errorText);
      } catch (readError) {
        console.error(`Could not read error response: ${readError}`);
      }
      return false;
    }
    
    const responseData = await response.json();
    console.log(`API health check response data:`, responseData);
    
    return true;
  } catch (error) {
    console.error("Error connecting to API:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};
