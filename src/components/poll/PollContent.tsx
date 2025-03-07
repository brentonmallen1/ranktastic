
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import VotingForm from "@/components/VotingForm";
import PollResults from "@/components/PollResults";
import type { Poll } from "@/lib/db";

interface PollContentProps {
  poll: Poll;
  pollId: string;
  onVoteSubmitted: () => void;
}

const PollContent = ({ poll, pollId, onVoteSubmitted }: PollContentProps) => {
  const [showResults, setShowResults] = useState(!poll.isOpen);

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  return (
    <>
      {poll.isOpen && (
        <div className="mb-6 flex justify-center">
          <Button 
            onClick={toggleResults}
            variant="outline"
          >
            {showResults ? "Cast Vote" : "View Results"}
          </Button>
        </div>
      )}

      {(showResults || !poll.isOpen) ? (
        <PollResults pollId={pollId} />
      ) : (
        <VotingForm 
          poll={poll} 
          onVoteSubmitted={() => {
            setShowResults(true);
            onVoteSubmitted();
          }} 
        />
      )}
    </>
  );
};

export default PollContent;
