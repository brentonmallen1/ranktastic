
import { API_BASE_URL, logRequest, logResponse, logError, safeParseResponse } from './config';
import type { Vote } from './types';

// Vote CRUD operations
export const submitVote = async (vote: Omit<Vote, "id" | "createdAt">): Promise<string> => {
  try {
    const apiUrl = `${API_BASE_URL}/votes`;
    logRequest('POST', apiUrl, vote);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vote),
    });

    if (!response.ok) {
      // Special handling for 404 errors
      if (response.status === 404) {
        console.error(`404 Not Found: The API endpoint ${apiUrl} could not be found.`);
        console.error(`Check that the server has the /votes route configured properly.`);
      }
      
      const errorText = await response.text();
      console.error(`Error response from ${apiUrl}:`, errorText);
      throw new Error(`Failed to submit vote: ${response.status} ${errorText}`);
    }

    try {
      const data = await safeParseResponse(response);
      logResponse('POST', apiUrl, response.status, data);
      return data.id;
    } catch (parseError) {
      logError('POST', apiUrl, parseError);
      throw parseError;
    }
  } catch (error) {
    logError('POST', `${API_BASE_URL}/votes`, error);
    throw error;
  }
};

export const getVotesForPoll = async (pollId: string): Promise<Vote[]> => {
  try {
    const apiUrl = `${API_BASE_URL}/polls/${pollId}/votes`;
    logRequest('GET', apiUrl);
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      // Special handling for 404
      if (response.status === 404) {
        console.error(`404 Not Found: The endpoint ${apiUrl} could not be found.`);
      }
      
      const errorText = await response.text();
      console.error(`Error response from ${apiUrl}:`, errorText);
      throw new Error(`Failed to get votes: ${response.status} ${errorText}`);
    }

    try {
      const votes = await safeParseResponse(response);
      logResponse('GET', apiUrl, response.status, votes);
      
      // Convert date strings to Date objects
      return votes.map((vote: any) => ({
        ...vote,
        createdAt: new Date(vote.createdAt),
      }));
    } catch (parseError) {
      logError('GET', apiUrl, parseError);
      throw parseError;
    }
  } catch (error) {
    logError('GET', `${API_BASE_URL}/polls/${pollId}/votes`, error);
    throw error;
  }
};

export const hasVoted = async (pollId: string, voterEmail: string): Promise<boolean> => {
  try {
    const apiUrl = `${API_BASE_URL}/polls/${pollId}/hasVoted?email=${encodeURIComponent(voterEmail)}`;
    logRequest('GET', apiUrl);
    
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from ${apiUrl}:`, errorText);
      throw new Error(`Failed to check if voter has voted: ${response.status} ${errorText}`);
    }

    try {
      const data = await safeParseResponse(response);
      logResponse('GET', apiUrl, response.status, data);
      return data.hasVoted;
    } catch (parseError) {
      logError('GET', apiUrl, parseError);
      throw parseError;
    }
  } catch (error) {
    logError('GET', `${API_BASE_URL}/polls/${pollId}/hasVoted`, error);
    throw error;
  }
};
