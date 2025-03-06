
import { API_BASE_URL, logRequest, logResponse, logError, safeParseResponse } from './config';

// Initialize DB is now a mock function for API compatibility
export const initDB = async (): Promise<boolean> => {
  try {
    console.log(`Connecting to API at ${API_BASE_URL}`);
    
    // Test API health check endpoint
    const healthUrl = `${API_BASE_URL}/health`;
    console.log(`Checking API health at: ${healthUrl}`);
    logRequest('GET', healthUrl);
    
    const response = await fetch(healthUrl);
    
    console.log(`API health check response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      console.error(`API health check failed with status: ${response.status}`);
      return false;
    }
    
    try {
      const responseData = await safeParseResponse(response);
      logResponse('GET', healthUrl, response.status, responseData);
      
      // Check if we got a valid response (not HTML)
      if (typeof responseData === 'string' && 
          (responseData.includes('<!DOCTYPE html>') || responseData.includes('<html'))) {
        console.error('Received HTML response for health check - API routing issue');
        return false;
      }
      
      console.log('API connection successful');
      return true;
    } catch (parseError) {
      logError('GET', healthUrl, parseError);
      return false;
    }
  } catch (error) {
    logError('GET', `${API_BASE_URL}/health`, error);
    console.error('Failed to connect to API:', error.message);
    return false;
  }
};
