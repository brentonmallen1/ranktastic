
import { API_BASE_URL, logRequest, logResponse, logError, safeParseResponse } from './config';

// Initialize DB is now a mock function for API compatibility
export const initDB = async (): Promise<boolean> => {
  try {
    console.log(`Connecting to API at ${API_BASE_URL}`);
    
    // Test API health check endpoint
    logRequest('GET', `${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`);
    
    console.log(`API health check response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`API health check failed with status: ${response.status}`);
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
