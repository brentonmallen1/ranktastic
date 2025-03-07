
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { X, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { updatePoll, clearPollVotes } from "@/lib/db";
import type { Poll } from "@/lib/db";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  options: z.array(z.string().min(1, { message: "Option cannot be empty" }))
    .min(2, { message: "At least 2 options are required" })
});

type FormValues = z.infer<typeof formSchema>;

interface EditPollFormProps {
  poll: Poll;
  isOpen: boolean;
  onClose: () => void;
  onPollUpdated: () => void;
}

const EditPollForm = ({ poll, isOpen, onClose, onPollUpdated }: EditPollFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionsChanged, setOptionsChanged] = useState(false);

  // Form setup with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: poll.title,
      description: poll.description,
      options: poll.options,
    },
  });

  // Reset form when poll changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: poll.title,
        description: poll.description,
        options: poll.options,
      });
      setOptionsChanged(false);
    }
  }, [poll, isOpen, form]);

  // Track if options have changed
  const watchOptions = form.watch("options");
  useEffect(() => {
    if (isOpen && Array.isArray(watchOptions)) {
      const originalOptionsSorted = [...poll.options].sort();
      const currentOptionsSorted = [...watchOptions].sort();
      
      // Check if options array changed (different length or different items)
      const optionsAreDifferent = 
        originalOptionsSorted.length !== currentOptionsSorted.length ||
        originalOptionsSorted.some((opt, index) => opt !== currentOptionsSorted[index]);
      
      setOptionsChanged(optionsAreDifferent);
    }
  }, [watchOptions, poll.options, isOpen]);

  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    form.setValue("options", currentOptions.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Prepare the updated poll
      const updatedPoll: Poll = {
        ...poll,
        title: values.title,
        description: values.description || "",
        options: values.options,
      };

      // Update the poll
      const success = await updatePoll(updatedPoll);

      if (success) {
        // If options changed, clear votes
        if (optionsChanged) {
          await clearPollVotes(poll.id);
          toast({
            title: "Poll updated",
            description: "Poll updated successfully. All votes have been cleared because options were changed.",
          });
        } else {
          toast({
            title: "Poll updated",
            description: "Poll updated successfully. Existing votes are preserved.",
          });
        }
        
        onPollUpdated();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to update poll",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating poll:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the poll",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Poll</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Poll title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a description for your poll" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Options</FormLabel>
              <Card className="mt-2">
                <CardContent className="p-4 space-y-2">
                  {form.getValues("options").map((_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`options.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeOption(index)}
                              disabled={form.getValues("options").length <= 2}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </CardContent>
              </Card>
              
              {optionsChanged && (
                <p className="text-sm text-yellow-600 mt-2">
                  Warning: Changing poll options will clear all existing votes.
                </p>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPollForm;
