import { z } from "zod";

export const enquirySchema = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(254).transform(value => value.toLowerCase()),
  message: z.string().trim().min(10, "Tell me a little about your project (at least 10 characters).").max(2000),
  sourcePath: z.string().max(250).regex(/^\/[a-zA-Z0-9/_-]*$/),
  website: z.string().max(0).optional(),
});
