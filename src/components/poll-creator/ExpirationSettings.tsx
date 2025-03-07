
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl, FormLabel, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import ExpirationDatePicker from "./ExpirationDatePicker";
import ExpirationTimePicker from "./ExpirationTimePicker";
import { PollFormValues } from "./types";

interface ExpirationSettingsProps {
  form: UseFormReturn<PollFormValues>;
}

const ExpirationSettings = ({ form }: ExpirationSettingsProps) => {
  const hasExpiration = form.watch("hasExpiration");

  return (
    <>
      <FormField
        control={form.control}
        name="hasExpiration"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Set Expiration</FormLabel>
              <FormDescription>
                Automatically close this poll at a specific date and time
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {hasExpiration && (
        <div className="grid gap-4">
          <ExpirationDatePicker form={form} />
          <ExpirationTimePicker form={form} />
        </div>
      )}
    </>
  );
};

export default ExpirationSettings;
