
import { API_BASE_URL, logRequest, logResponse } from './config';
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
    
    let responseData;
    try {
      responseData = await response.text();
      console.log(`Raw response:`, responseData);
      
      // Try to parse as JSON if possible
      if (responseData && responseData.trim().startsWith('{')) {
        responseData = JSON.parse(responseData);
      }
    } catch (parseError) {
      console.error(`Error parsing response:`, parseError);
    }
    
    if (!response.ok) {
      const errorDetails = typeof responseData === 'object' ? responseData : { raw: responseData };
      console.error(`Error response:`, errorDetails);
      throw new Error(`Failed to create poll: ${response.status} ${JSON.stringify(errorDetails)}`);
    }

    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error(`Invalid response format: ${responseData}`);
      }
    }
    
    console.log(`Create poll success, received:`, responseData);
    return responseData.id;
  } catch (error) {
    console.error("Error creating poll:", error);
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

export const closePoll = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/polls/${id}/close`, {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response:`, errorText);
      throw new Error(`Failed to get polls: ${response.status} ${errorText}`);
    }

    const polls = await response.json();
    logResponse('GET', apiUrl, response.status, polls);
    
    // Convert date strings to Date objects
    return polls.map((poll: any) => ({
      ...poll,
      createdAt: new Date(poll.createdAt),
      expiresAt: poll.expiresAt ? new Date(poll.expiresAt) : null,
    }));
  } catch (error) {
    console.error("Error getting polls:", error);
    throw error;
  }
};
