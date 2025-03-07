
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPoll } from "@/lib/db";
import PollForm from "./PollForm";
import { PollFormValues } from "./types";

interface PollCreatorProps {
  onPollCreated?: (pollId: string, pollTitle: string) => void;
}

const PollCreator = ({ onPollCreated }: PollCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFormSubmit = async (values: PollFormValues) => {
    try {
      setIsCreating(true);
      
      const cleanedOptions = values.options.filter(opt => opt.trim() !== "");
      
      const pollId = await createPoll({
        title: values.title,
        description: values.description || "",
        options: cleanedOptions,
        expiresAt: values.hasExpiration ? values.expiresAt : null,
        isOpen: true,
      });
      
      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully!",
      });
      
      onPollCreated?.(pollId, values.title);
      
      navigate(`/poll/${pollId}`);
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Failed to Create Poll",
        description: "There was a problem creating your poll. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass glass-hover animate-scale-in transition-smooth">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Poll</CardTitle>
          <CardDescription>
            Set up your ranked choice poll and share it with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PollForm onSubmit={handleFormSubmit} isCreating={isCreating} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PollCreator;
