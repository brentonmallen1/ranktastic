
import React from "react";
import { VoterForm, RankableOptions, ClosedPollState, VoterInfoFields } from "./";
import type { Poll } from "@/lib/db";

export interface VotingFormProps {
  poll: Poll;
  onVoteSubmitted: () => void;
}

const VotingForm = ({ poll, onVoteSubmitted }: VotingFormProps) => {
  return (
    <VoterForm poll={poll} onVoteSubmitted={onVoteSubmitted} />
  );
};

export default VotingForm;
