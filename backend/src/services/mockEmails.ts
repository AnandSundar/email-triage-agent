import { Email } from '../types';

interface MockEmailData {
  id: string;
  thread_id: string;
  sender: string;
  sender_name: string;
  subject: string;
  body: string;
  snippet: string;
  timestamp: Date;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  intent: string;
  labels: string[];
}

export function getMockEmails(): MockEmailData[] {
  const now = new Date();

  return [
    {
      id: 'demo_001',
      thread_id: 'demo_thread_001',
      sender: 'sarah.johnson@techcorp.com',
      sender_name: 'Sarah Johnson',
      subject: 'URGENT: Senior GRC Engineer Offer - Expires Tomorrow',
      body: `Hi there,

I hope this email finds you well. I'm following up on the Senior GRC Engineer offer we sent last week.

I wanted to personally reach out because this offer has a 48-hour acceptance window, and time is running out. Our hiring team was incredibly impressed with your background in security compliance and your experience with AWS security services.

The offer includes:
- $165,000 base salary
- $30,000 signing bonus
- Comprehensive benefits package
- Remote-first culture

We need your decision by EOD tomorrow (Friday), otherwise we'll need to move forward with another candidate we have in the pipeline.

Please let me know if you have any questions or if there's anything I can clarify to help with your decision.

Best regards,
Sarah Johnson
Senior Technical Recruiter
TechCorp Inc.`,
      snippet: "I'm following up on the Senior GRC Engineer offer we sent last week. This offer has a 48-hour acceptance window...",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      priority: 'urgent',
      intent: 'job_offer',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_002',
      thread_id: 'demo_thread_002',
      sender: 'alerts@paymentgateway.io',
      sender_name: 'Payment Gateway Alerts',
      subject: 'CRITICAL: Production Payment Gateway Down - Client Impact',
      body: `INCIDENT ALERT: Payment Gateway Service Outage

Severity: CRITICAL
Started: 25 minutes ago
Affected Services: All payment processing endpoints
Impact: 100% of transactions failing

Current Status:
Our payment gateway integration is experiencing a complete outage. All API endpoints are returning 503 errors. Client transaction volume has dropped to zero.

Error Details:
- HTTP 503 Service Unavailable
- Response time: timeout (>30s)
- Region: us-east-1
- Endpoint: api.paymentgateway.io/v1/charge

Affected Clients:
- Acme Corp (high volume)
- GlobalTech Solutions
- 12 other active clients

Immediate Action Required:
1. Check AWS CloudWatch for any infrastructure alerts
2. Verify service health on payment gateway status page
3. Prepare client communication template
4. Consider activating disaster recovery procedures

This is our highest severity incident. Please respond immediately with your assessment.

Incident ID: INC-2024-0428-001
Page the on-call engineer if no response within 15 minutes.`,
      snippet: "INCIDENT ALERT: Payment Gateway Service Outage - Severity: CRITICAL - Started: 25 minutes ago - All API endpoints returning 503...",
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      priority: 'urgent',
      intent: 'incident',
      labels: ['INBOX', 'UNREAD', 'IMPORTANT']
    },
    {
      id: 'demo_003',
      thread_id: 'demo_thread_003',
      sender: 'recruiting@fintechstartup.io',
      sender_name: 'Marcus Chen',
      subject: 'Congratulations! Offer for Senior Security Engineer role at FinTech Pro',
      body: `Dear Candidate,

I'm thrilled to inform you that we'd like to extend an offer for the Senior Security Engineer position at FinTech Pro!

After interviewing several exceptional candidates, your combination of security expertise, cloud architecture experience, and strong communication skills stood out. The team is excited about the possibility of working with you.

Offer Details:
Position: Senior Security Engineer
Base Salary: $175,000 - $195,000 (based on experience)
Equity: 0.05% - 0.10% stock options
Benefits: Health, dental, vision, 401k matching
Start Date: Flexible, ideally within 4-6 weeks

What you'll be working on:
- Leading security architecture for our payment processing platform
- Building SOC2 compliance framework from scratch
- Managing security audits and penetration testing
- Mentoring junior engineers on security best practices

Next Steps:
1. Review the detailed offer letter attached
2. Let us know your initial thoughts by end of week
3. We can schedule a call to answer any questions

We're building something special here, and we'd love for you to be part of it. Looking forward to hearing from you!

Best,
Marcus Chen
Head of Security
FinTech Pro`,
      snippet: "I'm thrilled to inform you that we'd like to extend an offer for the Senior Security Engineer position at FinTech Pro!...",
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      priority: 'high',
      intent: 'job_offer',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_004',
      thread_id: 'demo_thread_004',
      sender: 'compliance@enterprisecustomer.com',
      sender_name: 'Jennifer Martinez',
      subject: 'RE: SOC2 Type II Compliance Report Request - Due EOW',
      body: `Hi,

Following up on our vendor security review. Our compliance team has completed the initial assessment, and we're ready to move forward with the contract, but we need one final document.

Could you please provide your SOC2 Type II report by end of this week? Our auditor needs to review it before we can finalize the vendor approval process.

Specifically, we need:
- Full SOC2 Type II report (most recent audit)
- Any applicable addendums
- Summary of any findings or recommendations

This is a hard requirement for our enterprise procurement process. Without it, we won't be able to proceed with the Q2 contract renewal.

Our contract expires on May 15th, so we're working under a tight timeline here.

Let me know if you have any questions or if there's an alternative compliance framework we can consider in the meantime.

Thanks,
Jennifer Martinez
Compliance Manager
Enterprise Customer Inc.`,
      snippet: "Could you please provide your SOC2 Type II report by end of this week? Our auditor needs to review it...",
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      priority: 'high',
      intent: 'compliance_request',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_005',
      thread_id: 'demo_thread_005',
      sender: 'no-reply-aws@amazon.com',
      sender_name: 'AWS Billing',
      subject: 'AWS Billing Alert: Unusually High Charges Detected',
      body: `AWS Billing Notification

Account: 1234-5678-9012
Alert Type: Unusual Spend Alert
Threshold: $500 daily budget
Current Daily Spend: $1,247.53

Dear AWS Customer,

We detected unusually high charges on your AWS account for the billing period April 2026.

Top Cost Drivers:
1. Amazon SageMaker - $642.30 (ml.p3.2xlarge instances running 24/7)
2. Amazon EC2 - $385.12 (t3.medium instances in us-east-1)
3. AWS Lambda - $145.22 (increased invocation count)
4. Amazon S3 - $75.89 (data transfer out)

Recommended Actions:
- Review SageMaker notebook instances and stop idle ones
- Check EC2 auto-scaling configuration
- Investigate Lambda functions for infinite loops
- Set up budget alerts at lower thresholds

Your current month-to-date total is $3,892.47, compared to $847.23 for the same period last month.

Please review your AWS Cost Explorer dashboard for detailed breakdowns.

View your billing dashboard: https://console.aws.amazon.com/billing/

Thank you,
AWS Billing Team`,
      snippet: "We detected unusually high charges on your AWS account. Current daily spend: $1,247.53 vs $500 budget...",
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      priority: 'high',
      intent: 'billing_alert',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_006',
      thread_id: 'demo_thread_006',
      sender: 'dev@teammate.com',
      sender_name: 'Alex Rivera',
      subject: 'PR ready for review: Add OAuth2 authentication flow',
      body: `Hey!

I just opened PR #234 for the OAuth2 authentication feature we discussed in sprint planning. Would you have time to review it this week?

The PR includes:
- OAuth2 flow implementation using Auth0
- JWT token validation middleware
- Refresh token rotation logic
- Unit tests with 90% coverage
- Updated API documentation

Link: github.com/org/repo/pull/234
~450 lines changed across 8 files

I tried to follow the security best practices we discussed:
- PKCE flow for mobile apps
- Secure token storage guidelines
- Proper error handling without leaking sensitive info

Let me know if you have any feedback or if you'd like me to hop on a call to walk through the architecture.

Also, I noticed we might want to add rate limiting to the token endpoint - opened a separate issue for that.

Thanks!
Alex`,
      snippet: "I just opened PR #234 for the OAuth2 authentication feature. Would you have time to review it this week?...",
      timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000),
      priority: 'normal',
      intent: 'code_review',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_007',
      thread_id: 'demo_thread_007',
      sender: 'pm@company.com',
      sender_name: 'David Kim',
      subject: 'Q3 Roadmap Planning Meeting - Availability?',
      body: `Hi,

I'm scheduling our Q3 roadmap planning session for next week. Could you let me know your availability for a 2-hour block?

We'll be covering:
- Q2 retrospective and lessons learned
- Q3 priorities and OKRs
- Resource allocation for upcoming projects
- Technical debt vs new feature tradeoffs

Looking at either:
- Tuesday, May 6th: 10am-12pm PT
- Wednesday, May 7th: 2pm-4pm PT
- Thursday, May 8th: 9am-11am PT

Let me know which works best for you. I'll try to find a time that works for everyone on the engineering team.

Also, please come prepared with:
- Top 3 things you think we should prioritize
- Any blocking issues from Q2
- Ideas for improving our development process

Thanks,
David`,
      snippet: "I'm scheduling our Q3 roadmap planning session. Could you let me know your availability for a 2-hour block?...",
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      priority: 'normal',
      intent: 'meeting_request',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_008',
      thread_id: 'demo_thread_008',
      sender: 'sales@cloudvendor.com',
      sender_name: 'Michael Brown',
      subject: 'RE: Security monitoring platform proposal - Any questions?',
      body: `Hi there,

I wanted to follow up on the proposal I sent last week for our cloud security monitoring platform.

Have you had a chance to review it? I'd love to schedule a quick demo to show you the platform in action.

Our solution provides:
- Real-time security posture monitoring
- Automated compliance reporting (SOC2, ISO27001, HIPAA)
- Threat detection and alerting
- Integration with AWS, GCP, and Azure

We're currently offering 20% off annual contracts for new customers who sign by the end of May.

Would you be available for a 30-minute demo this week? I'm flexible on timing.

No pressure at all - just want to make sure you have everything you need to make an informed decision.

Best regards,
Michael Brown
Enterprise Account Executive
CloudVendor Inc.`,
      snippet: "I wanted to follow up on the proposal I sent last week. Would you be available for a 30-minute demo this week?...",
      timestamp: new Date(now.getTime() - 30 * 60 * 60 * 1000),
      priority: 'normal',
      intent: 'vendor_followup',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_009',
      thread_id: 'demo_thread_009',
      sender: 'newsletter@sans.org',
      sender_name: 'SANS Institute',
      subject: 'SANS Security Weekly: Top 5 Vulnerabilities in April 2026',
      body: `SANS Security Weekly Newsletter
Week of April 28, 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP 5 CRITICAL VULNERABILITIES THIS WEEK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CVE-2026-3847 - Apache Struts RCE (CVSS 9.8)
   A remote code execution vulnerability affects Apache Struts 2.5.33 and earlier. Patches available.

2. CVE-2026-3912 - Spring Framework Authorization Bypass (CVSS 9.1)
   Improper authorization in Spring Security could lead to privilege escalation. Upgrade to 6.1.x.

3. CVE-2026-3765 - Chrome Use-After-Free (CVSS 8.8)
   Google Chrome browser has a use-after-free flaw in the PDF component. Update to v124.0.6367.

4. CVE-2026-3891 - Linux Kernel Privilege Escalation (CVSS 7.8)
   A flaw in the netfilter subsystem allows local privilege escalation. Patch available in kernel 6.8.

5. CVE-2026-3945 - WordPress Plugin SQL Injection (CVSS 7.2)
   Popular WP plugin vulnerable to SQL injection. Update to version 3.2.1 or later.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPCOMING TRAINING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- SEC504: Hacker Tools, Techniques, and Hands-On Labs
  Next session: May 15-20, 2026 | Orlando, FL

- SEC560: Network Penetration Testing and Ethical Hacking
  Next session: June 5-10, 2026 | Austin, TX

You're receiving this because you subscribed to SANS Security Weekly.
Manage your subscription preferences: [Unsubscribe] [Update Profile]`,
      snippet: "TOP 5 CRITICAL VULNERABILITIES THIS WEEK - CVE-2026-3847 Apache Struts RCE - CVE-2026-3912 Spring Framework...",
      timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000),
      priority: 'low',
      intent: 'newsletter',
      labels: ['INBOX', 'UNREAD', 'NEWSLETTER']
    },
    {
      id: 'demo_010',
      thread_id: 'demo_thread_010',
      sender: 'noreply@github.com',
      sender_name: 'GitHub',
      subject: '[org/repo] Workflow run succeeded - CI Pipeline #8472',
      body: `GitHub Actions Workflow Notification

Repository: org/production-api
Workflow: CI Pipeline
Run #8472
Branch: main
Commit: a7f3b2c ("Add input validation to payment endpoint")

Status: SUCCESS

Duration: 4 minutes 23 seconds
Triggered by: Alex Rivera
Started: April 27, 2026 at 3:45 PM UTC
Finished: April 27, 2026 at 3:49 PM UTC

Jobs:
  - lint (32s)
  - test-unit (1m 45s)
  - test-integration (2m 6s)

All 287 tests passed with 92% code coverage.

View workflow run: https://github.com/org/production-api/actions/runs/8472

--
You're receiving this email because you're watching the org/production-api repository.
Manage your notifications: https://github.com/settings/notifications`,
      snippet: "Workflow run succeeded - All 287 tests passed with 92% code coverage - View workflow run...",
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      priority: 'low',
      intent: 'notification',
      labels: ['INBOX', 'UNREAD']
    },
    {
      id: 'demo_011',
      thread_id: 'demo_thread_011',
      sender: 'accountsreceivable@vendor.com',
      sender_name: 'Accounts Receivable Team',
      subject: 'FINAL NOTICE: Invoice #4821 - 45 Days Overdue - Legal Action Pending',
      body: `FINAL NOTICE BEFORE LEGAL ACTION

Invoice: #4821
Date: March 14, 2026
Amount Due: $3,200.00
Days Overdue: 45

Dear Customer,

This is our final attempt to collect payment for the above-referenced invoice before we escalate this matter to our legal department.

Despite our previous reminders on:
- April 10, 2026 (First reminder)
- April 17, 2026 (Second reminder)
- April 24, 2026 (Third reminder)

We have not received payment or any communication from you regarding this overdue invoice.

OUTSTANDING BALANCE: $3,200.00
LATE FEES ACCRUED: $320.00 (10% penalty)
TOTAL NOW DUE: $3,520.00

Unless payment is received in full within 5 business days (by May 5, 2026), we will be forced to:

1. Refer your account to our external collections agency
2. Assess additional collection costs (15% of balance)
3. Report delinquency to business credit bureaus
4. Pursue legal action through small claims court

To avoid further escalation, please remit payment immediately via:
- ACH Transfer: Routing 026073008 | Account 123456789
- Wire: Refer to invoice for details
- Credit Card: Call 555-123-4567

If you have already sent payment, please disregard this notice and provide proof of payment.

Accounts Receivable Department
Vendor Inc.`,
      snippet: "FINAL NOTICE BEFORE LEGAL ACTION - Invoice #4821 - $3,200 - 45 days overdue - Payment due by May 5 or legal action...",
      timestamp: new Date(now.getTime() - 54 * 60 * 60 * 1000),
      priority: 'urgent',
      intent: 'payment_reminder',
      labels: ['INBOX', 'UNREAD', 'IMPORTANT']
    },
    {
      id: 'demo_012',
      thread_id: 'demo_thread_012',
      sender: 'juniordev@company.com',
      sender_name: 'Taylor Kim',
      subject: 'Quick question about OAuth2 implementation',
      body: `Hey!

I'm working on implementing OAuth2 for the new feature and had a quick question.

I'm looking at the Auth0 documentation and I'm a bit confused about when to use PKCE vs the implicit flow. The docs say PKCE is recommended for mobile apps, but I'm not sure I understand the security implications.

Specifically:
- We have a React SPA frontend
- Python Flask backend
- Using Auth0 for authentication

Should I be using the Authorization Code flow with PKCE, or is the regular Authorization Code flow sufficient for our use case?

Also, I noticed in the existing code we're storing the access token in localStorage. Is that secure enough, or should we move to httpOnly cookies?

Sorry for all the questions - just want to make sure I'm doing this the right way from a security perspective.

Let me know when you have a moment to chat!

Thanks,
Taylor`,
      snippet: "I'm working on OAuth2 implementation and confused about PKCE vs implicit flow. Should I use Authorization Code with PKCE for a React SPA?...",
      timestamp: new Date(now.getTime() - 66 * 60 * 60 * 1000),
      priority: 'normal',
      intent: 'question',
      labels: ['INBOX', 'UNREAD']
    }
  ];
}

export function mockEmailToEmail(mockEmail: MockEmailData): Email {
  const priorityEmojiMap: Record<string, string> = {
    urgent: '🔴',
    high: '🟠',
    normal: '🟡',
    low: '🟢'
  };

  return {
    id: mockEmail.id,
    thread_id: mockEmail.thread_id,
    sender: mockEmail.sender,
    sender_name: mockEmail.sender_name,
    subject: mockEmail.subject,
    body: mockEmail.body,
    snippet: mockEmail.snippet,
    timestamp: mockEmail.timestamp.toISOString(),
    priority: mockEmail.priority,
    intent: mockEmail.intent,
    priority_emoji: priorityEmojiMap[mockEmail.priority],
    auto_reply_eligible: ['newsletter', 'notification'].includes(mockEmail.intent),
    requires_human_review: ['incident', 'job_offer', 'payment_reminder'].includes(mockEmail.intent),
    review_reason: ['incident'].includes(mockEmail.intent) ? 'Production incident requires immediate attention' : undefined,
    status: 'triaged',
    labels: mockEmail.labels
  };
}