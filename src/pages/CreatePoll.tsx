
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PollCreator from "@/components/PollCreator";
import SharePoll from "@/components/SharePoll";
import ApiStatusCheck from "@/components/ApiStatusCheck";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDatabase } from "@/lib/db";
import { useDebug } from "@/contexts/DebugContext";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface CreatedPollData {
  id: string;
  title: string;
}

const CreatePoll = () => {
  const { initialized } = useDatabase();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [createdPoll, setCreatedPoll] = useState<CreatedPollData | null>(null);
  const { showApiStatus, toggleApiStatus } = useDebug();

  const handlePollCreated = (pollId: string, pollTitle: string) => {
    setCreatedPoll({ id: pollId, title: pollTitle });
    setShowShareDialog(true);
  };

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        
        <main className="flex-1 py-10">
          <div className="container">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Create a New Poll</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleApiStatus} 
                className="text-muted-foreground"
                title="Toggle API Status Debug View"
              >
                <Settings className="h-4 w-4 mr-1" />
                Debug
              </Button>
            </div>
            <p className="text-muted-foreground mb-8">
              Create a ranked-choice poll to gather opinions and make decisions. 
              Add options, set an optional expiration date, and share with voters.
            </p>
            
            {/* API Status Check for debugging - only show when debug mode is enabled */}
            {showApiStatus && <ApiStatusCheck />}
            
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
          {createdPoll && (
            <div className="py-4">
              <p className="text-muted-foreground mb-6">
                Your poll has been created! Share it with others to start collecting votes.
              </p>
              <SharePoll pollId={createdPoll.id} pollTitle={createdPoll.title} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePoll;
