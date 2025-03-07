
// API configuration
// API base URL - using relative URL to respect host origin
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Debug helper for logging API requests
export const logRequest = (method: string, url: string, body?: any) => {
  console.log(`API ${method} Request to: ${url}`);
  if (body) {
    console.log('Request payload:', body);
  }
};

// Debug helper for logging API responses
export const logResponse = (method: string, url: string, status: number, data: any) => {
  console.log(`API ${method} Response from ${url}: Status ${status}`);
  console.log('Response data:', data);
};

// Debug helper for logging API errors
export const logError = (method: string, url: string, error: any) => {
  console.error(`API ${method} Error for ${url}:`, error);
  // Extract more useful error information
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack trace
  };
  console.error('Error details:', errorInfo);
  
  // Check if it's an HTML response error (getting HTML instead of JSON)
  if (typeof error.message === 'string' && 
      (error.message.includes('<!DOCTYPE') || error.message.includes('<html'))) {
    console.error('Received HTML instead of JSON. This typically means the API route is not found or is being handled incorrectly by the server.');
    console.error('Check the Nginx configuration to ensure /api/* requests are being correctly forwarded to the backend server.');
  }
};

// Function to check response type before parsing
export const safeParseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  console.log(`Response content-type: ${contentType}`);
  
  // Log the URL that's being accessed
  console.log(`Response URL: ${response.url}`);
  
  const text = await response.text();
  
  // If no content (like 204 responses), return null
  if (!text.trim()) {
    return null;
  }
  
  console.log(`Response text snippet (first 150 chars): ${text.substring(0, 150)}...`);
  
  // First check for HTML responses - this is a clear error case
  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    console.error('Received HTML instead of JSON. API endpoint is likely incorrect or not configured properly.');
    console.error('This could be because the request is being routed to the frontend server instead of the backend API.');
    console.error('Check your Nginx configuration to ensure /api requests are being correctly forwarded');
    throw new Error('Received HTML instead of API JSON response. Server configuration issue.');
  }
  
  // If it looks like JSON or is supposed to be JSON, parse it
  if (contentType?.includes('application/json') || 
      (text.trim().startsWith('{') && text.trim().endsWith('}')) ||
      (text.trim().startsWith('[') && text.trim().endsWith(']'))) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Error parsing JSON response:', err);
      console.error('Raw response text:', text.substring(0, 500));
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  }
  
  // For other response types, return the text
  return text;
};
