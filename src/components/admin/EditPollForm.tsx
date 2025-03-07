
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { updatePoll, clearPollVotes } from "@/lib/db";
import type { Poll } from "@/lib/db";
import { editPollFormSchema, type EditPollFormValues } from "./EditPollSchema";
import PollFormFields from "./PollFormFields";
import EditPollFormActions from "./EditPollFormActions";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditPollFormValues | null>(null);

  // Form setup with default values
  const form = useForm<EditPollFormValues>({
    resolver: zodResolver(editPollFormSchema),
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
      setShowConfirmDialog(false);
      setPendingValues(null);
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

  const handleFormSubmit = (values: EditPollFormValues) => {
    if (optionsChanged) {
      // Store values and show confirmation dialog
      setPendingValues(values);
      setShowConfirmDialog(true);
    } else {
      // Proceed with update
      processUpdate(values);
    }
  };

  const processUpdate = async (values: EditPollFormValues) => {
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

  const handleConfirmClearVotes = () => {
    if (pendingValues) {
      processUpdate(pendingValues);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelClearVotes = () => {
    setShowConfirmDialog(false);
    setPendingValues(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Poll</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <PollFormFields form={form} optionsChanged={optionsChanged} />
              <EditPollFormActions isSubmitting={isSubmitting} onClose={onClose} />
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Existing Votes?</AlertDialogTitle>
            <AlertDialogDescription>
              You've changed the poll options. This will erase all existing votes for this poll.
              Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClearVotes}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearVotes}>
              Yes, Clear Votes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditPollForm;
