export interface Email {
  id: string;
  thread_id: string;
  sender: string;
  sender_name?: string;
  subject: string;
  body?: string;
  snippet: string;
  timestamp: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  intent: string;
  priority_emoji?: string;
  suggested_action?: string;
  draft_id?: string;
  auto_reply_eligible: boolean;
  requires_human_review: boolean;
  review_reason?: string;
  status: string;
  processed_at?: string;
  labels?: string[];
}

export interface Draft {
  id: string;
  email_id: string;
  thread_id: string;
  subject: string;
  body: string;
  tone?: string;
  quality_score?: number;
  requires_human_review: boolean;
  review_reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  created_at: string;
  original_subject?: string;
  original_sender?: string;
}

export interface FollowUp {
  id: number;
  email_id: string;
  thread_id: string;
  follow_up_at: string;
  message?: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface AgentLog {
  id: number;
  run_at: string;
  emails_processed: number;
  drafts_created: number;
  follow_ups_scheduled: number;
  errors?: string;
  duration_seconds?: number;
}

export interface Analytics {
  total_emails: number;
  emails_by_priority: Record<string, number>;
  emails_by_intent: Record<string, number>;
  emails_by_status: Record<string, number>;
  total_drafts: number;
  drafts_by_status: Record<string, number>;
  total_follow_ups: number;
  follow_ups_by_status: Record<string, number>;
  auto_reply_eligible: number;
  requires_human_review: number;
}

export interface ClassifyEmailRequest {
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  intent?: string;
}

export interface UpdateDraftRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'edited';
  subject?: string;
  body?: string;
}

export interface CreateFollowUpRequest {
  email_id: string;
  thread_id: string;
  follow_up_at: string;
  message?: string;
}

export interface TriageResult {
  emails_processed: number;
  drafts_created: number;
  follow_ups_scheduled: number;
  errors: string[];
}