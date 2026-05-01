import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic();

export interface ClassificationResult {
  priority: 'urgent' | 'high' | 'normal' | 'low';
  intent: string;
  suggested_action?: string;
  auto_reply_eligible: boolean;
  requires_human_review: boolean;
  review_reason?: string;
}

export interface DraftResult {
  subject: string;
  body: string;
  tone: string;
  quality_score: number;
}

export async function classifyEmail(subject: string, body: string): Promise<ClassificationResult> {
  const demoMode = process.env.DEMO_MODE === 'true';

  if (demoMode || !process.env.ANTHROPIC_API_KEY) {
    return getMockClassification(subject, body);
  }

  const priorityMap: Record<string, 'urgent' | 'high' | 'normal' | 'low'> = {
    'URGENT': 'urgent',
    'CRITICAL': 'urgent',
    'FINAL NOTICE': 'urgent',
    'HIGH': 'high',
    'IMPORTANT': 'high',
    'BILLING': 'high'
  };

  for (const [keyword, priority] of Object.entries(priorityMap)) {
    if (subject.toUpperCase().includes(keyword)) {
      return {
        priority,
        intent: getIntentFromContent(subject, body),
        suggested_action: getSuggestedAction(priority, getIntentFromContent(subject, body)),
        auto_reply_eligible: false,
        requires_human_review: ['urgent', 'high'].includes(priority),
        review_reason: priority === 'urgent' ? 'High priority email requires human review' : undefined
      };
    }
  }

  return {
    priority: 'normal',
    intent: getIntentFromContent(subject, body),
    auto_reply_eligible: false,
    requires_human_review: false
  };
}

export async function generateDraft(
  subject: string,
  body: string,
  intent: string,
  tone: string = 'professional'
): Promise<DraftResult> {
  const demoMode = process.env.DEMO_MODE === 'true';

  if (demoMode || !process.env.ANTHROPIC_API_KEY) {
    return getMockDraft(subject, body, intent, tone);
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate a response draft for an email.

Subject: ${subject}
Body: ${body}
Intent: ${intent}
Requested tone: ${tone}

Provide a professional draft response. Return JSON with subject, body, tone, and quality_score (0-1).
`
    }]
  });

  const responseText = msg.content[0].type === 'text' ? msg.content[0].text : '';
  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch {
    return {
      subject: `Re: ${subject}`,
      body: responseText,
      tone,
      quality_score: 0.7
    };
  }
}

function getMockClassification(subject: string, body: string): ClassificationResult {
  const upperSubject = subject.toUpperCase();

  if (upperSubject.includes('URGENT') || upperSubject.includes('CRITICAL') || upperSubject.includes('FINAL NOTICE')) {
    return {
      priority: 'urgent',
      intent: getIntentFromContent(subject, body),
      suggested_action: getSuggestedAction('urgent', getIntentFromContent(subject, body)),
      auto_reply_eligible: false,
      requires_human_review: true,
      review_reason: 'Urgent email requires immediate human attention'
    };
  }

  if (upperSubject.includes('BILLING') || upperSubject.includes('OFFER') || upperSubject.includes('COMPLIANCE')) {
    return {
      priority: 'high',
      intent: getIntentFromContent(subject, body),
      suggested_action: getSuggestedAction('high', getIntentFromContent(subject, body)),
      auto_reply_eligible: false,
      requires_human_review: true,
      review_reason: 'High priority email may need human review'
    };
  }

  if (upperSubject.includes('NEWSLETTER') || upperSubject.includes('GITHUB') || upperSubject.includes('WORKFLOW')) {
    return {
      priority: 'low',
      intent: getIntentFromContent(subject, body),
      auto_reply_eligible: true,
      requires_human_review: false
    };
  }

  return {
    priority: 'normal',
    intent: getIntentFromContent(subject, body),
    auto_reply_eligible: false,
    requires_human_review: false
  };
}

function getMockDraft(subject: string, body: string, intent: string, tone: string): DraftResult {
  const draftTemplates: Record<string, { subject: string; body: string }> = {
    job_offer: {
      subject: `Re: ${subject}`,
      body: `Thank you for getting back to me regarding the offer. I appreciate the opportunity and am reviewing the details. I'll provide my decision by the deadline.

Best regards`
    },
    meeting_request: {
      subject: `Re: ${subject}`,
      body: `Thank you for reaching out about the meeting. I'm available on the dates you mentioned.

Would [proposed time] work for a 2-hour session?

Looking forward to discussing the roadmap.

Best regards`
    },
    code_review: {
      subject: `Re: ${subject}`,
      body: `Thanks for the PR! I'll review it this week.

A few initial thoughts:
- The PKCE implementation looks solid
- Consider adding rate limiting as you mentioned

I'll provide detailed feedback once I've completed the full review.

Thanks for following the security best practices!`
    }
  };

  const template = draftTemplates[intent] || {
    subject: `Re: ${subject}`,
    body: `Thank you for your email. I will review and respond shortly.

Best regards`
  };

  return {
    ...template,
    tone,
    quality_score: 0.85
  };
}

function getIntentFromContent(subject: string, body: string): string {
  const content = `${subject} ${body}`.toLowerCase();

  if (content.includes('offer') || content.includes('recruit')) return 'job_offer';
  if (content.includes('incident') || content.includes('outage') || content.includes('critical')) return 'incident';
  if (content.includes('payment') || content.includes('invoice') || content.includes('overdue')) return 'payment_reminder';
  if (content.includes('compliance') || content.includes('soc2') || content.includes('audit')) return 'compliance_request';
  if (content.includes('billing') || content.includes('aws') || content.includes('charge')) return 'billing_alert';
  if (content.includes('pr ') || content.includes('pull request') || content.includes('review')) return 'code_review';
  if (content.includes('meeting') || content.includes('schedule') || content.includes('availability')) return 'meeting_request';
  if (content.includes('vendor') || content.includes('proposal') || content.includes('demo')) return 'vendor_followup';
  if (content.includes('newsletter') || content.includes('weekly')) return 'newsletter';
  if (content.includes('github') || content.includes('workflow') || content.includes('pipeline')) return 'notification';
  if (content.includes('question') || content.includes('how to') || content.includes('confused')) return 'question';

  return 'general';
}

function getSuggestedAction(priority: string, intent: string): string {
  const actions: Record<string, string> = {
    'urgent+job_offer': 'Review offer details and respond immediately with decision',
    'urgent+incident': 'Escalate to on-call engineer and activate incident response',
    'urgent+payment_reminder': 'Process payment immediately to avoid legal action',
    'high+job_offer': 'Review offer and schedule call with recruiter',
    'high+compliance_request': 'Prepare SOC2 report for customer',
    'high+billing_alert': 'Review AWS costs and investigate unusual charges'
  };

  return actions[`${priority}+${intent}`] || 'Review and respond appropriately';
}