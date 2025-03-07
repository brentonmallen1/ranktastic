
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface ClosedPollStateProps {
  pollId: string;
}

const FinalizedPollState = ({ pollId }: ClosedPollStateProps) => {
  const navigate = useNavigate();

  return (
    <Card className="glass glass-hover animate-scale-in max-w-3xl mx-auto transition-smooth">
      <CardHeader>
        <CardTitle className="text-2xl text-center flex items-center justify-center">
          <Shield className="h-5 w-5 mr-2" />
          Poll Finalized
        </CardTitle>
        <CardDescription className="text-center">
          This poll has been finalized and is no longer accepting votes
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">This poll has been finalized by the creator or has expired.</p>
        <Button onClick={() => navigate(`/results/${pollId}`)}>
          View Results
        </Button>
      </CardContent>
    </Card>
  );
};

export default FinalizedPollState;
