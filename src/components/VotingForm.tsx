
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ArrowUpDown, Check, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { hasVoted, submitVote } from "@/lib/db";
import type { Poll } from "@/lib/db";

// Schema for form validation
const formSchema = z.object({
  voterName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  voterEmail: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  rankings: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

export interface VotingFormProps {
  poll: Poll;
  onVoteSubmitted: () => void;
}

const VotingForm = ({ poll, onVoteSubmitted }: VotingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Create a copy of options for reordering
  const [rankedOptions, setRankedOptions] = useState([...poll.options]);

  // Form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voterName: "",
      voterEmail: "",
      rankings: rankedOptions,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
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

  // Handle drag end event
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(rankedOptions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setRankedOptions(items);
    form.setValue("rankings", items);
  };

  // Move option up in the list
  const moveOptionUp = (index: number) => {
    if (index === 0) return;
    
    const newOptions = [...rankedOptions];
    [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]];
    
    setRankedOptions(newOptions);
    form.setValue("rankings", newOptions);
  };

  // Move option down in the list
  const moveOptionDown = (index: number) => {
    if (index === rankedOptions.length - 1) return;
    
    const newOptions = [...rankedOptions];
    [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
    
    setRankedOptions(newOptions);
    form.setValue("rankings", newOptions);
  };

  if (!poll.isOpen) {
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
          <Button onClick={() => navigate(`/results/${poll.id}`)}>
            View Results
          </Button>
        </CardContent>
      </Card>
    );
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
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="voterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} className="transition-smooth" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="voterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        {...field} 
                        className="transition-smooth" 
                      />
                    </FormControl>
                    <FormDescription>
                      To prevent duplicate votes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Rank Your Choices</FormLabel>
                <div className="flex items-center text-sm text-muted-foreground">
                  <ArrowUpDown className="mr-1 h-4 w-4" />
                  Drag or use arrows to reorder
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="rankings"
                render={() => (
                  <FormItem>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="rankings">
                        {(provided) => (
                          <ul
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {rankedOptions.map((option, index) => (
                              <Draggable key={option} draggableId={option} index={index}>
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex items-center gap-2 p-3 bg-background/50 rounded-md border transition-smooth group"
                                  >
                                    <div 
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing p-1"
                                    >
                                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                      {index + 1}
                                    </span>
                                    
                                    <span className="flex-1">{option}</span>
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveOptionUp(index)}
                                        disabled={index === 0}
                                        className="h-8 w-8"
                                      >
                                        <ChevronUp className="h-4 w-4" />
                                      </Button>
                                      
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => moveOptionDown(index)}
                                        disabled={index === rankedOptions.length - 1}
                                        className="h-8 w-8"
                                      >
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
