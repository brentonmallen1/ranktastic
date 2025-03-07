
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ClosedPollMessageProps {
  pollId: string;
}

const ClosedPollMessage = ({ pollId }: ClosedPollMessageProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="glass glass-hover animate-scale-in max-w-3xl mx-auto transition-smooth">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Poll Closed</CardTitle>
        <CardDescription className="text-center">
          This poll is no longer accepting votes
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">This poll has been closed by the creator or has expired.</p>
        <Button onClick={() => navigate(`/results/${pollId}`)}>
          View Results
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClosedPollMessage;
