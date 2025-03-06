
import { API_BASE_URL, logRequest, logResponse, logError, safeParseResponse } from './config';

// Initialize DB is now a mock function for API compatibility
export const initDB = async (): Promise<boolean> => {
  try {
    console.log(`Connecting to API at ${API_BASE_URL}`);
    
    // Test initial connection to base API endpoint
    try {
      logRequest('GET', `${API_BASE_URL}/`);
      const baseResponse = await fetch(`${API_BASE_URL}/`);
      console.log(`Base API response status: ${baseResponse.status}`);
      
      if (baseResponse.ok) {
        const baseData = await baseResponse.text();
        console.log(`Base API response: ${baseData.substring(0, 100)}...`);
        
        // Check if we're getting HTML instead of API response
        if (baseData.includes('<!DOCTYPE html>') || baseData.includes('<html')) {
          console.warn('Base API endpoint is returning HTML instead of API response. Check server routing configuration.');
        }
      } else {
        console.error(`Base API request failed with status: ${baseResponse.status}`);
      }
    } catch (baseError) {
      logError('GET', `${API_BASE_URL}/`, baseError);
    }
    
    // Log environment variables for debugging
    console.log('Environment configuration:');
    console.log(`- VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
    console.log(`- Current origin: ${window.location.origin}`);
    console.log(`- Current path: ${window.location.pathname}`);
    console.log(`- Actual API_BASE_URL used: ${API_BASE_URL}`);
    
    // Test API health check endpoint
    logRequest('GET', `${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`);
    
    console.log(`API health check response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
    
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
    
    try {
      const responseData = await safeParseResponse(response);
      logResponse('GET', `${API_BASE_URL}/health`, response.status, responseData);
      return true;
    } catch (parseError) {
      logError('GET', `${API_BASE_URL}/health`, parseError);
      return false;
    }
  } catch (error) {
    logError('GET', `${API_BASE_URL}/health`, error);
    return false;
  }
};
