
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { hasVoted, submitVote } from "@/lib/db";
import type { Poll } from "@/lib/db";
import { VoterInfoFields } from "./";
import { RankingList } from "./";
import { ClosedPollMessage } from "./";

// Schema for form validation
const formSchema = z.object({
  voterName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  voterEmail: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  rankings: z.array(z.string()),
});

export type VotingFormValues = z.infer<typeof formSchema>;

export interface VotingFormProps {
  poll: Poll;
  onVoteSubmitted: () => void;
}

const VotingForm = ({ poll, onVoteSubmitted }: VotingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Create a copy of options for reordering
  const [rankedOptions, setRankedOptions] = useState([...poll.options]);

  // Form with default values
  const form = useForm<VotingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voterName: "",
      voterEmail: "",
      rankings: rankedOptions,
    },
  });

  // Handle form submission
  const onSubmit = async (values: VotingFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if user already voted
      if (values.voterEmail) {
        const alreadyVoted = await hasVoted(poll.id, values.voterEmail);
        if (alreadyVoted) {
          toast({
            title: "Already Voted",
            description: "You have already submitted a vote for this poll.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Submit the vote
      await submitVote({
        pollId: poll.id,
        voterName: values.voterName,
        voterEmail: values.voterEmail || null,
        rankings: rankedOptions,
      });
      
      // Show success message
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded successfully!",
      });
      
      // Reset form and notify parent
      form.reset();
      onVoteSubmitted();
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Failed to Submit Vote",
        description: "There was a problem recording your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!poll.isOpen) {
    return <ClosedPollMessage pollId={poll.id} />;
  }

  return (
    <Card className="glass glass-hover animate-scale-in max-w-3xl mx-auto transition-smooth">
      <CardHeader>
        <CardTitle className="text-2xl">{poll.title}</CardTitle>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <VoterInfoFields form={form} />
            
            <Separator />
            
            <RankingList 
              form={form} 
              rankedOptions={rankedOptions} 
              setRankedOptions={setRankedOptions} 
            />
            
            <CardFooter className="px-0 pb-0 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="transition-smooth w-full"
              >
                {isSubmitting ? (
                  "Submitting Vote..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Vote
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VotingForm;
