
import { PlusCircle, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PollFormValues } from "./types";

interface PollOptionsListProps {
  form: UseFormReturn<PollFormValues>;
}

const PollOptionsList = ({ form }: PollOptionsListProps) => {
  const { toast } = useToast();
  const options = form.watch("options");
  
  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    if (currentOptions.length <= 2) {
      toast({
        title: "Cannot Remove Option",
        description: "You need at least 2 options for a poll.",
        variant: "destructive",
      });
      return;
    }
    
    const newOptions = currentOptions.filter((_, i) => i !== index);
    form.setValue("options", newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name={`options.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1 m-0">
                  <FormControl>
                    <Input 
                      placeholder={`Option ${index + 1}`} 
                      {...field} 
                      className="transition-smooth" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeOption(index)}
              className="transition-smooth"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={addOption}
        className="transition-smooth"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Option
      </Button>
    </div>
  );
};

export default PollOptionsList;
