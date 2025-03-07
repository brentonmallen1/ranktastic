
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SharePoll from "@/components/SharePoll";

interface PollNavigationProps {
  pollId: string;
  pollTitle: string;
}

const PollNavigation = ({ pollId, pollTitle }: PollNavigationProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <SharePoll pollId={pollId} pollTitle={pollTitle} compact={true} />
    </div>
  );
};

export default PollNavigation;
