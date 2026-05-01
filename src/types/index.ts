export interface Email {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  date: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  intent: 'question' | 'request' | 'complaint' | 'feedback' | 'newsletter' | 'other';
  status: 'new' | 'triaged' | 'actioned' | 'archived';
  summary?: string;
  suggestedAction?: string;
  body: string;
  hasAttachments: boolean;
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