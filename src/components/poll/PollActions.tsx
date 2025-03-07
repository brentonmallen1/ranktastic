
import React from "react";
import { Button } from "@/components/ui/button";

interface PollActionsProps {
  isOpen: boolean;
  showResults: boolean;
  toggleResults: () => void;
}

const PollActions = ({ isOpen, showResults, toggleResults }: PollActionsProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="mb-6 flex justify-center">
      <Button 
        onClick={toggleResults}
        variant="outline"
      >
        {showResults ? "Cast Vote" : "View Results"}
      </Button>
    </div>
  );
};

export default PollActions;
