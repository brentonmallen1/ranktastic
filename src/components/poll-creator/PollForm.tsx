
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { CardFooter } from "@/components/ui/card";
import PollBasicInfo from "./PollBasicInfo";
import PollOptionsSection from "./PollOptionsSection";
import ExpirationSettings from "./ExpirationSettings";
import { formSchema, PollFormValues } from "./types";
import { set } from "date-fns";

interface PollFormProps {
  onSubmit: (values: PollFormValues) => Promise<void>;
  isCreating: boolean;
}

const PollForm = ({ onSubmit, isCreating }: PollFormProps) => {
  const form = useForm<PollFormValues>({
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

  const handleSubmit = async (values: PollFormValues) => {
    try {
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
        
        values.expiresAt = expirationDate;
      }
      
      await onSubmit(values);
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PollBasicInfo form={form} />
        <PollOptionsSection form={form} />
        <Separator />
        <ExpirationSettings form={form} />
        
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
  );
};

export default PollForm;
