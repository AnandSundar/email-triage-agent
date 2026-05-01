import { z } from 'zod';

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const emailFilterSchema = paginationSchema.extend({
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  intent: z.enum(['meeting_request', 'project_update', 'deadline', 'question', 'approval_request', 'other']).optional(),
  status: z.enum(['new', 'triaged', 'replied', 'archived']).optional(),
});

const draftFilterSchema = paginationSchema.extend({
  status: z.enum(['pending', 'approved', 'discarded']).optional(),
});

const followupFilterSchema = paginationSchema.extend({
  status: z.enum(['pending', 'sent', 'cancelled']).optional(),
});

export const createDraftSchema = z.object({
  email_id: z.string().uuid(),
  thread_id: z.string(),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  tone: z.enum(['professional', 'friendly', 'formal']).optional().default('professional'),
  requires_human_review: z.boolean().optional().default(false),
});

export const generateDraftSchema = z.object({
  email_id: z.string().uuid(),
});

export const updateDraftSchema = z.object({
  status: z.enum(['pending', 'approved', 'discarded']).optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(10000).optional(),
});

export const createFollowUpSchema = z.object({
  email_id: z.string().uuid(),
  thread_id: z.string(),
  follow_up_at: z.string().datetime(),
  message: z.string().max(5000).optional(),
});

export const updateFollowUpSchema = z.object({
  status: z.enum(['pending', 'sent', 'cancelled']),
});

export const classifyEmailSchema = z.object({
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  intent: z.enum(['meeting_request', 'project_update', 'deadline', 'question', 'approval_request', 'other']).optional(),
});

export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
});

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; error: string } => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ') };
  };
}

export { paginationSchema, emailFilterSchema, draftFilterSchema, followupFilterSchema };
