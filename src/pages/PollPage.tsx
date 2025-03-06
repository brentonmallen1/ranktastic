
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPoll, getVotesForPoll, useDatabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import VotingForm from "@/components/VotingForm";
import PollResults from "@/components/PollResults";
import SharePoll from "@/components/SharePoll";
import AdminPollControls from "@/components/admin/AdminPollControls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Mail } from "lucide-react";
import { format } from "date-fns";
import type { Poll, Vote } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

const PollPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { initialized, initialize } = useDatabase();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showVoterDetails, setShowVoterDetails] = useState(false);
  const isAdminUser = isAdmin();

  const fetchPoll = async () => {
    if (!id) {
      setError("Invalid poll ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const pollData = await getPoll(id);
      
      if (!pollData) {
        setError("Poll not found");
      } else {
        setPoll(pollData);
        
        if (!pollData.isOpen) {
          setShowResults(true);
        }

        // Fetch votes if admin
        if (isAdminUser) {
          const votesData = await getVotesForPoll(id);
          setVotes(votesData);
        }
      }
    } catch (err) {
      console.error("Error fetching poll:", err);
      setError("Failed to load the poll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) {
      fetchPoll();
    } else {
      initialize();
    }
  }, [id, initialized, initialize]);

  const handleVoteSubmitted = () => {
    toast({
      title: "Vote submitted!",
      description: "Your vote has been recorded.",
    });
    setShowResults(true);
    // Refresh votes if admin
    if (isAdminUser && id) {
      getVotesForPoll(id).then(setVotes);
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  const toggleVoterDetails = () => {
    setShowVoterDetails(!showVoterDetails);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-16 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container max-w-4xl py-16 mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">
          {error || "An error occurred"}
        </h2>
        <p className="mb-8">We couldn't find the poll you're looking for.</p>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <AdminPollControls 
        pollId={poll.id} 
        isOpen={poll.isOpen} 
        onPollUpdated={fetchPoll}
      />

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
                {poll.isOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdminUser && (
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
      )}

      <div className="mb-6">
        <SharePoll pollId={poll.id} pollTitle={poll.title} />
      </div>

      {poll.isOpen && (
        <div className="mb-6 flex justify-center">
          <Button 
            onClick={toggleResults}
            variant="outline"
          >
            {showResults ? "Cast Vote" : "View Results"}
          </Button>
        </div>
      )}

      {(showResults || !poll.isOpen) ? (
        <PollResults pollId={poll.id} />
      ) : (
        <VotingForm 
          poll={poll} 
          onVoteSubmitted={handleVoteSubmitted} 
        />
      )}
    </div>
  );
};

export default PollPage;
