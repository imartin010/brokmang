/**
 * Zod Schemas for Validation
 * Type-safe validation for forms and server actions
 */

import { z } from 'zod';

export const RoleSchema = z.object({
  user_type: z.enum(['ceo', 'team_leader']),
});

export type RoleInput = z.infer<typeof RoleSchema>;
