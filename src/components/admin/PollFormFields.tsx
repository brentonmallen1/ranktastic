
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { EditPollFormValues } from "./EditPollSchema";
import PollOptionsField from "./PollOptionsField";

interface PollFormFieldsProps {
  form: UseFormReturn<EditPollFormValues>;
  optionsChanged: boolean;
}

const PollFormFields = ({ form, optionsChanged }: PollFormFieldsProps) => {
  return (
    <div className="space-y-4">
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
      
      <PollOptionsField form={form} optionsChanged={optionsChanged} />
    </div>
  );
};

export default PollFormFields;
