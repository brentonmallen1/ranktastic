
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { UseFormReturn } from "react-hook-form";
import { PollFormValues } from "./types";

interface BulkImportOptionsProps {
  form: UseFormReturn<PollFormValues>;
}

const BulkImportOptions = ({ form }: BulkImportOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleBulkImport = (text: string) => {
    if (!text) return;
    
    const importedOptions = text
      .split(',')
      .map(option => option.trim())
      .filter(option => option !== "");
      
    if (importedOptions.length < 2) {
      toast({
        title: "Invalid Import",
        description: "Please provide at least 2 comma-separated options.",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("options", importedOptions);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="outline"
          className="transition-smooth"
        >
          Import Options
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Bulk Import Options</h4>
          <p className="text-sm text-muted-foreground">
            Enter comma-separated options to quickly add multiple items.
          </p>
          <Textarea
            placeholder="Option 1, Option 2, Option 3"
            className="min-h-24"
            onChange={(e) => handleBulkImport(e.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BulkImportOptions;
