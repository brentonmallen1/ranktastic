
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PollFormValues } from "./types";

// Generate hour options (0-23)
const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: i.toString().padStart(2, '0')
}));

// Generate minute options (0, 15, 30, 45)
const minuteOptions = [0, 15, 30, 45].map(min => ({
  value: min.toString().padStart(2, '0'),
  label: min.toString().padStart(2, '0')
}));

interface ExpirationTimePickerProps {
  form: UseFormReturn<PollFormValues>;
}

const ExpirationTimePicker = ({ form }: ExpirationTimePickerProps) => {
  const expiresAt = form.watch("expiresAt");
  
  return (
    <>
      <div className="flex flex-row gap-4">
        <FormField
          control={form.control}
          name="expirationHour"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Hour</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hourOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expirationMinute"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Minute</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {minuteOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {expiresAt && (
        <div className="text-sm text-muted-foreground">
          Your poll will automatically close on {expiresAt ? format(expiresAt, "PPP") : ""} at {form.watch("expirationHour") || "23"}:{form.watch("expirationMinute") || "59"}
        </div>
      )}
    </>
  );
};

export default ExpirationTimePicker;
