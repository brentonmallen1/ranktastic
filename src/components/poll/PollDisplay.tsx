
import React from "react";
import PollResults from "@/components/PollResults";
import VotingForm from "@/components/VotingForm";
import type { Poll } from "@/lib/db";

interface PollDisplayProps {
  poll: Poll;
  pollId: string;
  showResults: boolean;
  onVoteSubmitted: () => void;
}

const PollDisplay = ({ poll, pollId, showResults, onVoteSubmitted }: PollDisplayProps) => {
  return (
    <>
      {(showResults || !poll.isOpen) ? (
        <PollResults pollId={pollId} />
      ) : (
        <VotingForm 
          poll={poll} 
          onVoteSubmitted={onVoteSubmitted}
        />
      )}
    </>
  );
};

export default PollDisplay;
