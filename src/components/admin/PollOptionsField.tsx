
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { EditPollFormValues } from "./EditPollSchema";

interface PollOptionsFieldProps {
  form: UseFormReturn<EditPollFormValues>;
  optionsChanged: boolean;
}

const PollOptionsField = ({ form, optionsChanged }: PollOptionsFieldProps) => {
  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    form.setValue("options", currentOptions.filter((_, i) => i !== index));
  };

  return (
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
  );
};

export default PollOptionsField;
