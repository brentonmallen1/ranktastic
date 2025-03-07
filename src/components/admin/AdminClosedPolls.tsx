
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAllPolls, useDatabase } from "@/lib/db";
import type { Poll } from "@/lib/db";
import PollCard from "./PollCard";

const AdminFinalizedPolls = () => {
  const { toast } = useToast();
  const { initialized } = useDatabase();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      console.log("Fetching finalized polls...");
      const allPolls = await getAllPolls();
      console.log("All polls fetched:", allPolls);
      // Filter only finalized polls
      const finalizedPolls = allPolls.filter(poll => !poll.isOpen);
      console.log("Finalized polls:", finalizedPolls);
      setPolls(finalizedPolls);
    } catch (error) {
      console.error("Failed to fetch polls:", error);
      toast({
        title: "Error",
        description: "Failed to load polls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) {
      console.log("Database initialized, fetching finalized polls");
      fetchPolls();
    } else {
      console.log("Database not initialized yet");
    }
  }, [initialized]);

  if (loading) {
    return <div className="text-center py-10">Loading polls...</div>;
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-500">No finalized polls found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <PollCard 
          key={poll.id} 
          poll={poll} 
          onPollAction={fetchPolls}
        />
      ))}
    </div>
  );
};

export default AdminFinalizedPolls;
