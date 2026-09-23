import { z } from "zod";

export const candidateIdParamSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID"),
});
