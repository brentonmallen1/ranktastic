
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, BarChart3, Edit, Lock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Poll } from "@/lib/db";
import EditPollForm from "./EditPollForm";

interface PollCardProps {
  poll: Poll;
  onPollAction: () => void;
  showCloseButton?: boolean;
  onClosePoll?: (pollId: string) => Promise<void>;
}

const PollCard = ({ 
  poll, 
  onPollAction,
  showCloseButton = false,
  onClosePoll,
}: PollCardProps) => {
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleViewResults = () => {
    navigate(`/results/${poll.id}`);
  };
  
  const handleClosePoll = async () => {
    if (onClosePoll) {
      try {
        await onClosePoll(poll.id);
        onPollAction();
      } catch (error) {
        console.error("Failed to close poll:", error);
      }
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl flex-1 mr-2">{poll.title}</CardTitle>
            <Badge variant={poll.isOpen ? "default" : "destructive"}>
              {poll.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-muted-foreground mb-4">
            {poll.description || "No description provided"}
          </p>
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Created: {format(new Date(poll.createdAt), "MMM d, yyyy")}
            </div>
            {poll.expiresAt && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Expires: {format(new Date(poll.expiresAt), "MMM d, yyyy")}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Poll Options:</p>
            <ul className="list-disc list-inside text-sm">
              {poll.options.map((option, index) => (
                <li key={index} className="text-muted-foreground">{option}</li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewResults}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Results
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {showCloseButton && poll.isOpen && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClosePoll}
            >
              <Lock className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
        </CardFooter>
      </Card>

      <EditPollForm
        poll={poll}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onPollUpdated={onPollAction}
      />
    </>
  );
};

export default PollCard;
