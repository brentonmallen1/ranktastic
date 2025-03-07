
import * as z from "zod";

export const formSchema = z.object({
  title: z.string().min(3, { message: "Poll title must be at least 3 characters" }),
  description: z.string().optional(),
  options: z.array(z.string().min(1, { message: "Option cannot be empty" }))
    .min(2, { message: "You need at least 2 options" }),
  hasExpiration: z.boolean().default(false),
  expiresAt: z.date().optional().nullable(),
  expirationHour: z.string().optional(),
  expirationMinute: z.string().optional(),
});

export type PollFormValues = z.infer<typeof formSchema>;

export interface Poll {
  title: string;
  description: string;
  options: string[];
  expiresAt: Date | null;
  isOpen: boolean;
}
