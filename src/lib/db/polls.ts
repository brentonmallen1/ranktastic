import { API_BASE_URL, logRequest, logResponse, logError, safeParseResponse } from './config';
import type { Poll } from './types';

// Poll CRUD operations
export const createPoll = async (poll: Omit<Poll, "id" | "createdAt">): Promise<string> => {
  try {
    console.log(`Creating poll with data:`, poll);
    const apiUrl = `${API_BASE_URL}/polls`;
    console.log(`Sending request to: ${apiUrl}`);
    
    logRequest('POST', apiUrl, poll);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(poll),
    });

    console.log(`Create poll response status:`, response.status);
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      // For 404 errors, add extra debugging info
      if (response.status === 404) {
        console.error(`404 Not Found: The API endpoint ${apiUrl} could not be found.`);
        console.error(`Check that the server has the /polls route configured properly.`);
        console.error(`Also verify that the VITE_API_URL (${import.meta.env.VITE_API_URL}) is correct.`);
      }
      
      const errorText = await response.text();
      console.error(`Error response:`, errorText);
      throw new Error(`Failed to create poll: ${response.status} ${errorText}`);
    }

    try {
      const responseData = await safeParseResponse(response);
      logResponse('POST', apiUrl, response.status, responseData);
      
      if (!responseData.id) {
        throw new Error(`Invalid response: missing poll ID: ${JSON.stringify(responseData)}`);
      }
      
      return responseData.id;
    } catch (parseError) {
      logError('POST', apiUrl, parseError);
      throw parseError;
    }
  } catch (error) {
    logError('POST', `${API_BASE_URL}/polls`, error);
    throw error;
  }
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to get poll");
    }

    const poll = await response.json();
    
    // Convert date strings to Date objects
    return {
      ...poll,
      createdAt: new Date(poll.createdAt),
      expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
    };
  } catch (error) {
    console.error("Error getting poll:", error);
    throw error;
  }
};

export const updatePoll = async (poll: Poll): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${poll.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(poll),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating poll:", error);
    throw error;
  }
};

export const closePoll = async (pollId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/close`, {
      method: "PUT",
    });

    return response.ok;
  } catch (error) {
    console.error("Error closing poll:", error);
    throw error;
  }
};

export const deletePoll = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting poll:", error);
    throw error;
  }
};

export const getAllPolls = async (): Promise<Poll[]> => {
  try {
    const apiUrl = `${API_BASE_URL}/polls`;
    console.log(`Fetching all polls from: ${apiUrl}`);
    
    logRequest('GET', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log(`Get all polls response status:`, response.status);
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));

    if (!response.ok) {
      // For 404 errors, add extra debugging info
      if (response.status === 404) {
        console.error(`404 Not Found: The API endpoint ${apiUrl} could not be found.`);
        console.error(`Check that the server has the /polls route configured properly.`);
      }
      
      const errorText = await response.text();
      console.error(`Error response:`, errorText);
      throw new Error(`Failed to get polls: ${response.status} ${errorText}`);
    }

    try {
      const polls = await safeParseResponse(response);
      logResponse('GET', apiUrl, response.status, polls);
      
      // Convert date strings to Date objects
      return polls.map((poll: any) => ({
        ...poll,
        createdAt: new Date(poll.createdAt),
        expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
      }));
    } catch (parseError) {
      logError('GET', apiUrl, parseError);
      throw parseError;
    }
  } catch (error) {
    logError('GET', `${API_BASE_URL}/polls`, error);
    throw error;
  }
};

export const clearPollVotes = async (pollId: string): Promise<boolean> => {
  try {
    const apiUrl = `${API_BASE_URL}/polls/${pollId}/votes`;
    logRequest('DELETE', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from ${apiUrl}:`, errorText);
      throw new Error(`Failed to clear votes: ${response.status} ${errorText}`);
    }

    return true;
  } catch (error) {
    logError('DELETE', `${API_BASE_URL}/polls/${pollId}/votes`, error);
    throw error;
  }
};
