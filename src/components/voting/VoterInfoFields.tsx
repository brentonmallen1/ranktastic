
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { VotingFormValues } from "./VotingForm";

interface VoterInfoFieldsProps {
  form: UseFormReturn<VotingFormValues>;
}

const VoterInfoFields = ({ form }: VoterInfoFieldsProps) => {
  return (
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
  );
};

export default VoterInfoFields;
