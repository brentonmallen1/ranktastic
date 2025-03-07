
import React, { useState } from "react";
import PollActions from "./PollActions";
import PollDisplay from "./PollDisplay";
import { isAdmin } from "@/lib/auth";
import type { Poll } from "@/lib/db";

interface PollContentProps {
  poll: Poll;
  pollId: string;
  onVoteSubmitted: () => void;
}

const PollContent = ({ poll, pollId, onVoteSubmitted }: PollContentProps) => {
  const isAdminUser = isAdmin();
  // Default to showing results only if:
  // 1. Poll is finalized (not open) OR
  // 2. User is an admin and they want to see results
  const [showResults, setShowResults] = useState(!poll.isOpen);

  const toggleResults = () => {
    // Only admin can toggle between results and voting
    if (isAdminUser) {
      setShowResults(!showResults);
    }
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
          // For admin users, show the results after voting
          // For regular users, the thank you dialog will be shown instead
          if (isAdminUser) {
            setShowResults(true);
          }
          onVoteSubmitted();
        }}
      />
    </>
  );
};

export default PollContent;
