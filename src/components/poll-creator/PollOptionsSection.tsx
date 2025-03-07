
import { FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import PollOptionsList from "./PollOptionsList";
import BulkImportOptions from "./BulkImportOptions";
import { PollFormValues } from "./types";

interface PollOptionsSectionProps {
  form: UseFormReturn<PollFormValues>;
}

const PollOptionsSection = ({ form }: PollOptionsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormLabel>Poll Options</FormLabel>
      <PollOptionsList form={form} />
      
      <div className="flex flex-col sm:flex-row gap-3">
        <BulkImportOptions form={form} />
      </div>
    </div>
  );
};

export default PollOptionsSection;
