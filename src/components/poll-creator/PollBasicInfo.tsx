
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PollFormValues } from "./types";

interface PollBasicInfoProps {
  form: UseFormReturn<PollFormValues>;
}

const PollBasicInfo = ({ form }: PollBasicInfoProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poll Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter poll title" {...field} className="transition-smooth" />
            </FormControl>
            <FormDescription>
              Give your poll a clear, descriptive title
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add a description or instructions for voters"
                {...field}
                className="resize-none transition-smooth min-h-24"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PollBasicInfo;
