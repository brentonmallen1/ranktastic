
import React, { useState } from "react";
import PollActions from "./PollActions";
import PollDisplay from "./PollDisplay";
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
      <PollActions 
        isOpen={poll.isOpen}
        showResults={showResults}
        toggleResults={toggleResults}
      />

      <PollDisplay
        poll={poll}
        pollId={pollId}
        showResults={showResults}
        onVoteSubmitted={() => {
          setShowResults(true);
          onVoteSubmitted();
        }}
      />
    </>
  );
};

export default PollContent;
