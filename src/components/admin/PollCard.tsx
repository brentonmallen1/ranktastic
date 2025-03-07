
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ExternalLink, Edit, Lock, Trash2, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deletePoll } from "@/lib/db";
import type { Poll } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PollCardProps {
  poll: Poll;
  onPollAction: () => void;
  showCloseButton?: boolean;
  onClosePoll?: (pollId: string) => Promise<void>;
}

const PollCard = ({ poll, onPollAction, showCloseButton = false, onClosePoll }: PollCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);

  const handleViewPoll = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  const handleEditPoll = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  const handleViewResults = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  const handleClosePoll = async (pollId: string) => {
    if (!onClosePoll) return;
    
    try {
      await onClosePoll(pollId);
      toast({
        title: "Poll closed",
        description: "The poll has been closed successfully",
      });
      onPollAction();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close the poll",
        variant: "destructive",
      });
    }
  };

  const handleDeletePoll = async () => {
    if (!pollToDelete) return;

    try {
      await deletePoll(pollToDelete);
      toast({
        title: "Poll deleted",
        description: "The poll has been deleted successfully",
      });
      onPollAction();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the poll",
        variant: "destructive",
      });
    } finally {
      setPollToDelete(null);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{poll.title}</CardTitle>
          <Badge variant={poll.isOpen ? "default" : "secondary"}>{poll.options.length} options</Badge>
        </div>
        <CardDescription className="line-clamp-2">{poll.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-gray-500 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Created: {new Date(poll.createdAt).toLocaleDateString()}
        </div>
        {poll.expiresAt && (
          <div className="text-sm text-gray-500 mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {poll.isOpen ? "Expires" : "Expired"}: {new Date(poll.expiresAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => handleViewPoll(poll.id)}>
          <ExternalLink className="h-4 w-4 mr-1" />
          View
        </Button>
        
        {poll.isOpen && (
          <Button size="sm" variant="outline" onClick={() => handleEditPoll(poll.id)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        
        {!poll.isOpen && (
          <Button size="sm" variant="outline" onClick={() => handleViewResults(poll.id)}>
            <BarChart2 className="h-4 w-4 mr-1" />
            Results
          </Button>
        )}
        
        {showCloseButton && poll.isOpen && onClosePoll && (
          <Button size="sm" variant="outline" onClick={() => handleClosePoll(poll.id)}>
            <Lock className="h-4 w-4 mr-1" />
            Close
          </Button>
        )}
        
        <Dialog open={pollToDelete === poll.id} onOpenChange={(open) => {
          if (!open) setPollToDelete(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive" onClick={() => setPollToDelete(poll.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
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
              <Button variant="outline" onClick={() => setPollToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePoll}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PollCard;
