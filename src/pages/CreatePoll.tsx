
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PollCreator from "@/components/PollCreator";
import SharePoll from "@/components/SharePoll";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDatabase } from "@/lib/db";

const CreatePoll = () => {
  const { initialize } = useDatabase();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);

  // Initialize database on mount
  useEffect(() => {
    initialize();
  }, []);

  const handlePollCreated = (pollId: string) => {
    setCreatedPollId(pollId);
    setShowShareDialog(true);
  };

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        
        <main className="flex-1 py-10">
          <div className="container">
            <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>
            <p className="text-muted-foreground mb-8">
              Create a ranked-choice poll to gather opinions and make decisions. 
              Add options, set an optional expiration date, and share with voters.
            </p>
            <PollCreator onPollCreated={handlePollCreated} />
          </div>
        </main>
        
        <Footer />
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your New Poll</DialogTitle>
          </DialogHeader>
          {createdPollId && (
            <div className="py-4">
              <p className="text-muted-foreground mb-6">
                Your poll has been created! Share it with others to start collecting votes.
              </p>
              <SharePoll pollId={createdPollId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePoll;

