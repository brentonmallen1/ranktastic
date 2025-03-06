import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VotingForm from "@/components/VotingForm";
import PollResults from "@/components/PollResults";
import SharePoll from "@/components/SharePoll";
import { getPoll, useDatabase, type Poll } from "@/lib/db";

const PollPage = () => {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { initialize } = useDatabase();

  useEffect(() => {
    const loadPoll = async () => {
      try {
        await initialize();
        if (!id) {
          setError("Poll ID is missing");
          return;
        }
        
        const pollData = await getPoll(id);
        if (!pollData) {
          setError("Poll not found");
          return;
        }
        
        setPoll(pollData);
      } catch (err) {
        console.error("Error loading poll:", err);
        setError("Failed to load poll");
        toast({
          title: "Error",
          description: "Failed to load poll data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-10">
          <div className="container">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p className="text-muted-foreground mb-6">{error || "Poll not found"}</p>
              <a href="/" className="text-primary hover:underline">Return to home</a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{poll.title}</h1>
            <SharePoll pollId={poll.id} />
          </div>
          
          {poll.description && (
            <p className="text-muted-foreground mb-8">{poll.description}</p>
          )}
          
          {poll.isOpen ? (
            <VotingForm poll={poll} onVoteSubmitted={() => {}} />
          ) : (
            <PollResults pollId={poll.id} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PollPage;
