import { z } from "zod";

export const ZListMembersSchema = z.object({
  // AIM: raised from 100 so the admin users table can load the whole instance at once.
  limit: z.number().min(1).max(500),
  cursor: z.number().nullish(),
  searchTerm: z.string().nullish(),
});

export type TListMembersSchema = z.infer<typeof ZListMembersSchema>;
