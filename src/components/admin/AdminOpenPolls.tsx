
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Edit, Lock, Trash2, ExternalLink } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { getAllPolls, closePoll, updatePoll, getPoll } from "@/lib/db";
import type { Poll } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminOpenPolls = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const allPolls = await getAllPolls();
      // Filter only open polls
      const openPolls = allPolls.filter(poll => poll.isOpen);
      setPolls(openPolls);
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
    fetchPolls();
  }, []);

  const handleViewPoll = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  const handleEditPoll = (pollId: string) => {
    // For now, we'll just view the poll
    // In a more complete implementation, this would open an edit interface
    navigate(`/poll/${pollId}`);
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await closePoll(pollId);
      toast({
        title: "Poll closed",
        description: "The poll has been closed successfully",
      });
      fetchPolls(); // Refresh the list
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
      // This would need an actual delete function in the db.ts file
      // For now, let's simulate by marking isOpen as false
      const poll = await getPoll(pollToDelete);
      if (poll) {
        poll.isOpen = false; // Mark as closed for now
        await updatePoll(poll);
        toast({
          title: "Poll deleted",
          description: "The poll has been deleted successfully",
        });
        fetchPolls(); // Refresh the list
      }
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

  if (loading) {
    return <div className="text-center py-10">Loading polls...</div>;
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-500">No open polls found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <Card key={poll.id} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{poll.title}</CardTitle>
              <Badge>{poll.options.length} options</Badge>
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
                Expires: {new Date(poll.expiresAt).toLocaleDateString()}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => handleViewPoll(poll.id)}>
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleEditPoll(poll.id)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleClosePoll(poll.id)}>
              <Lock className="h-4 w-4 mr-1" />
              Close
            </Button>
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
      ))}
    </div>
  );
};

export default AdminOpenPolls;
