
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Lock, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { closePoll, deletePoll } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { isAuthenticated } from "@/lib/auth";

interface AdminPollControlsProps {
  pollId: string;
  isOpen: boolean;
  onPollUpdated: () => void;
}

const AdminPollControls = ({ pollId, isOpen, onPollUpdated }: AdminPollControlsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  // Only render if user is authenticated as admin and we have a valid pollId
  if (!isAuthenticated() || !pollId) {
    console.log("Not rendering AdminPollControls", { authenticated: isAuthenticated(), pollId });
    return null;
  }

  const handleFinalizePoll = async () => {
    try {
      setIsFinalizing(true);
      console.log("Finalizing poll:", pollId);
      await closePoll(pollId);
      toast({
        title: "Poll finalized",
        description: "The poll has been finalized successfully",
      });
      onPollUpdated();
    } catch (error) {
      console.error("Error finalizing poll:", error);
      toast({
        title: "Error",
        description: "Failed to finalize the poll",
        variant: "destructive",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDeletePoll = async () => {
    try {
      setIsDeleting(true);
      console.log("Deleting poll:", pollId);
      await deletePoll(pollId);
      toast({
        title: "Poll deleted",
        description: "The poll has been deleted successfully",
      });
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast({
        title: "Error",
        description: "Failed to delete the poll",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 mr-2 text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Admin Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          As an admin, you can manage this poll using the controls below.
        </p>
        <div className="flex flex-wrap gap-2">
          {isOpen && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFinalizePoll}
              disabled={isFinalizing}
            >
              <Lock className="h-4 w-4 mr-1" />
              {isFinalizing ? "Finalizing..." : "Finalize Poll"}
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Poll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Poll</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this poll? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleting(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeletePoll}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPollControls;
