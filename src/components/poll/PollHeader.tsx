
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Shield, Users } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import type { Poll } from "@/lib/db";
import { getVotesForPoll } from "@/lib/db";

interface PollHeaderProps {
  poll: Poll;
}

const PollHeader = ({ poll }: PollHeaderProps) => {
  const [voteCount, setVoteCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchVoteCount = async () => {
      try {
        const votes = await getVotesForPoll(poll.id);
        setVoteCount(votes.length);
      } catch (error) {
        console.error("Failed to fetch vote count:", error);
        setVoteCount(0);
      }
    };

    fetchVoteCount();
  }, [poll.id]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">{poll.title}</CardTitle>
        <CardDescription>{poll.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Created: {format(new Date(poll.createdAt), "PPP")}
          </div>
          {poll.expiresAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Expires: {format(new Date(poll.expiresAt), "PPP p")}
            </div>
          )}
          <div className="flex items-center">
            Status: <span className={`ml-1 ${poll.isOpen ? "text-green-600" : "text-red-600"}`}>
              {poll.isOpen ? "Open" : "Finalized"}
            </span>
            {!poll.isOpen && <Shield className="h-4 w-4 ml-1 text-red-600" />}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Votes: {voteCount !== null ? voteCount : "Loading..."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollHeader;
