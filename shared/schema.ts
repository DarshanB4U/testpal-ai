// This file is kept for backward compatibility.
// All schema definitions have been moved to Prisma schema.
// Please import types from '@shared/types' instead.

import { z } from 'zod';

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string(),
  email: z.string().email(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;