
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
