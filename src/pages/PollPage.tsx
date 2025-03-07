
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPoll, getVotesForPoll } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useDbInitializer } from "@/hooks/use-db-initializer";
import { 
  LoadingState, 
  ErrorState, 
  PollHeader, 
  VoterStats, 
  PollContent, 
  PollNavigation 
} from "@/components/poll";
import AdminPollControls from "@/components/admin/AdminPollControls";
import type { Poll, Vote } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const PollPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { dbInitialized, loading, setLoading, error, setError } = useDbInitializer();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const isAdminUser = isAdmin();

  useEffect(() => {
    let isMounted = true;
    
    const fetchPollData = async () => {
      if (!id || (!dbInitialized)) {
        console.log("PollPage: Cannot fetch poll data yet, waiting for DB initialization", {
          id,
          dbInitialized
        });
        return;
      }
      
      try {
        console.log("PollPage: Fetching poll data for ID:", id);
        setLoading(true);
        
        const pollData = await getPoll(id);
        
        if (!isMounted) return;
        
        if (!pollData) {
          console.log("PollPage: Poll not found with ID:", id);
          setError("Poll not found");
        } else {
          console.log("PollPage: Poll found:", pollData.title);
          setPoll(pollData);

          if (isAdminUser) {
            const votesData = await getVotesForPoll(id);
            if (isMounted) setVotes(votesData);
          }
        }
      } catch (err) {
        console.error("PollPage: Error fetching poll:", err);
        if (isMounted) setError("Failed to load the poll");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPollData();
    
    return () => {
      isMounted = false;
    };
  }, [id, dbInitialized, isAdminUser, setLoading, setError]);

  const fetchPoll = async () => {
    if (!id || (!dbInitialized)) {
      console.log("PollPage: Cannot fetch poll: missing ID or DB not initialized", { 
        id, 
        dbInitialized
      });
      return;
    }

    try {
      console.log("PollPage: Manually refreshing poll data for ID:", id);
      const pollData = await getPoll(id);
      
      if (!pollData) {
        setError("Poll not found");
        console.log("PollPage: Poll not found during manual refresh");
      } else {
        console.log("PollPage: Poll refreshed successfully:", pollData.title);
        setPoll(pollData);
        
        if (isAdminUser) {
          const votesData = await getVotesForPoll(id);
          setVotes(votesData);
        }
      }
    } catch (err) {
      console.error("PollPage: Error fetching poll:", err);
      setError("Failed to load the poll");
    }
  };

  const handleVoteSubmitted = () => {
    toast({
      title: "Vote submitted!",
      description: "Your vote has been recorded.",
    });
    
    if (isAdminUser && id) {
      getVotesForPoll(id).then(setVotes);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error || !poll) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <PollNavigation pollId={poll.id} pollTitle={poll.title} />
      
      <AdminPollControls 
        pollId={poll.id} 
        isOpen={poll.isOpen} 
        onPollUpdated={fetchPoll}
      />

      <PollHeader poll={poll} />

      {isAdminUser && (
        <VoterStats votes={votes} />
      )}

      <PollContent 
        poll={poll} 
        pollId={id || ""} 
        onVoteSubmitted={handleVoteSubmitted} 
      />
    </div>
  );
};

export default PollPage;

