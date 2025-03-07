
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Save } from "lucide-react";

interface EditPollFormActionsProps {
  isSubmitting: boolean;
  onClose: () => void;
}

const EditPollFormActions = ({ isSubmitting, onClose }: EditPollFormActionsProps) => {
  return (
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
  );
};

export default EditPollFormActions;
