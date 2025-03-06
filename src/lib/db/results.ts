
import { getPoll, getVotesForPoll } from "./index";
import type { Poll } from "./types";

// Utility functions for computing results
export const computeResults = async (pollId: string): Promise<{
  rankings: Array<{ option: string; score: number }>;
  totalVotes: number;
  statistics: {
    firstChoiceDistribution: Record<string, number>;
    eliminationRounds: Array<{
      round: number;
      eliminated: string;
      scores: Record<string, number>;
    }>;
  };
}> => {
  try {
    const poll = await getPoll(pollId);
    if (!poll) throw new Error("Poll not found");

    const votes = await getVotesForPoll(pollId);
    if (votes.length === 0) {
      return {
        rankings: poll.options.map(option => ({ option, score: 0 })),
        totalVotes: 0,
        statistics: {
          firstChoiceDistribution: Object.fromEntries(poll.options.map(option => [option, 0])),
          eliminationRounds: []
        }
      };
    }

    // Compute first choice distribution
    const firstChoiceDistribution: Record<string, number> = {};
    for (const option of poll.options) {
      firstChoiceDistribution[option] = 0;
    }

    for (const vote of votes) {
      const firstChoice = vote.rankings[0];
      if (firstChoice) {
        firstChoiceDistribution[firstChoice] = (firstChoiceDistribution[firstChoice] || 0) + 1;
      }
    }

    // Implement Instant Runoff Voting (IRV) algorithm
    let remainingOptions = [...poll.options];
    let currentVotes = [...votes];
    const eliminationRounds: Array<{
      round: number;
      eliminated: string;
      scores: Record<string, number>;
    }> = [];

    while (remainingOptions.length > 1) {
      // Count first choices
      const scores: Record<string, number> = {};
      for (const option of remainingOptions) {
        scores[option] = 0;
      }

      for (const vote of currentVotes) {
        // Find the first choice that's still in the running
        const validChoice = vote.rankings.find(option => remainingOptions.includes(option));
        if (validChoice) {
          scores[validChoice] = (scores[validChoice] || 0) + 1;
        }
      }

      // Find option with lowest score
      let minScore = Infinity;
      let optionToEliminate = "";

      for (const option of remainingOptions) {
        if (scores[option] < minScore) {
          minScore = scores[option];
          optionToEliminate = option;
        }
      }

      // Record this elimination round
      eliminationRounds.push({
        round: poll.options.length - remainingOptions.length + 1,
        eliminated: optionToEliminate,
        scores: { ...scores }
      });

      // Remove the eliminated option
      remainingOptions = remainingOptions.filter(option => option !== optionToEliminate);
    }

    // Compute final rankings
    const finalScores: Record<string, number> = {};
    for (const option of poll.options) {
      // Count how often this option beat other options across all votes
      let score = 0;
      for (const vote of votes) {
        const rank = vote.rankings.indexOf(option);
        if (rank !== -1) {
          // Lower rank is better (0 is best)
          score += (poll.options.length - rank);
        }
      }
      finalScores[option] = score;
    }

    // Sort options by score (highest to lowest)
    const rankings = poll.options
      .map(option => ({ option, score: finalScores[option] }))
      .sort((a, b) => b.score - a.score);

    return {
      rankings,
      totalVotes: votes.length,
      statistics: {
        firstChoiceDistribution,
        eliminationRounds
      }
    };
  } catch (error) {
    console.error("Error computing results:", error);
    throw error;
  }
};
