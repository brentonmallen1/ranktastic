
import * as z from "zod";

// Form validation schema
export const editPollFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  options: z.array(z.string().min(1, { message: "Option cannot be empty" }))
    .min(2, { message: "At least 2 options are required" })
});

export type EditPollFormValues = z.infer<typeof editPollFormSchema>;
