import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, Clock, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, set } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createPoll } from "@/lib/db";

interface PollCreatorProps {
  onPollCreated?: (pollId: string, pollTitle: string) => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Poll title must be at least 3 characters" }),
  description: z.string().optional(),
  options: z.array(z.string().min(1, { message: "Option cannot be empty" }))
    .min(2, { message: "You need at least 2 options" }),
  hasExpiration: z.boolean().default(false),
  expiresAt: z.date().optional().nullable(),
  expirationHour: z.string().optional(),
  expirationMinute: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

const PollCreator = ({ onPollCreated }: PollCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      options: ["", ""],
      hasExpiration: false,
      expiresAt: null,
      expirationHour: "23",
      expirationMinute: "59",
    },
  });

  const hasExpiration = form.watch("hasExpiration");
  const options = form.watch("options");
  const expiresAt = form.watch("expiresAt");

  const onSubmit = async (values: FormValues) => {
    try {
      setIsCreating(true);
      
      const cleanedOptions = values.options.filter(opt => opt.trim() !== "");
      
      // Set the time on the expiration date if it exists
      let expirationDate = values.expiresAt;
      if (values.hasExpiration && expirationDate) {
        const hour = parseInt(values.expirationHour || "23");
        const minute = parseInt(values.expirationMinute || "59");
        
        expirationDate = set(expirationDate, {
          hours: hour,
          minutes: minute,
          seconds: 59,
        });
      }
      
      const pollId = await createPoll({
        title: values.title,
        description: values.description || "",
        options: cleanedOptions,
        expiresAt: values.hasExpiration ? expirationDate : null,
        isOpen: true,
      });
      
      toast({
        title: "Poll Created",
        description: "Your poll has been created successfully!",
      });
      
      onPollCreated?.(pollId, values.title);
      
      navigate(`/poll/${pollId}`);
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Failed to Create Poll",
        description: "There was a problem creating your poll. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="glass glass-hover animate-scale-in transition-smooth">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Poll</CardTitle>
          <CardDescription>
            Set up your ranked choice poll and share it with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              
              <div className="space-y-4">
                <FormLabel>Poll Options</FormLabel>
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
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="transition-smooth"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                  
                  <Popover>
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
                </div>
              </div>
              
              <Separator />
              
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
                <>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiration Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                  </div>
                </>
              )}
              
              <CardFooter className="px-0 pb-0 pt-6">
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="transition-smooth w-full sm:w-auto"
                >
                  {isCreating ? (
                    "Creating Poll..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Poll
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PollCreator;
