
import React, { useState } from "react";
import { format } from "date-fns";
import { User, Mail } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Vote } from "@/lib/db";

interface VoterStatsProps {
  votes: Vote[];
}

const VoterStats = ({ votes }: VoterStatsProps) => {
  const [showVoterDetails, setShowVoterDetails] = useState(false);

  const toggleVoterDetails = () => {
    setShowVoterDetails(!showVoterDetails);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Vote Statistics</CardTitle>
        <CardDescription>
          {votes.length} {votes.length === 1 ? "vote" : "votes"} cast so far
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            onClick={toggleVoterDetails}
          >
            {showVoterDetails ? "Hide Voter Details" : "Show Voter Details"}
          </Button>
        </div>
        
        {showVoterDetails && votes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Voters:</h3>
            <div className="border rounded-md divide-y">
              {votes.map((vote) => (
                <div key={vote.id} className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <User className="h-4 w-4 mr-2" />
                    <span>{vote.voterName}</span>
                  </div>
                  {vote.voterEmail && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{vote.voterEmail}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                    {format(new Date(vote.createdAt), "PPP p")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showVoterDetails && votes.length === 0 && (
          <p className="text-muted-foreground">No votes have been cast yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default VoterStats;
