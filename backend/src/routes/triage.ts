import { Router, Request, Response } from 'express';
import { getDatabase, runQuery, runExec, saveDatabase } from '../db/database';
import { classifyEmail, generateDraft } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/run', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();

  let emailsProcessed = 0;
  let draftsCreated = 0;
  let followUpsScheduled = 0;
  const errors: string[] = [];

  const db = await getDatabase();

  const unprocessedEmails = runQuery("SELECT * FROM emails WHERE status = 'pending' OR status IS NULL", []);

  let emailsToProcess: any[] = [];

  if (unprocessedEmails.length > 0) {
    emailsToProcess = unprocessedEmails;
  } else {
    const allEmails = runQuery('SELECT * FROM emails', []);
    if (allEmails.length === 0) {
      return res.status(400).json({ error: 'No emails to process. Fetch emails first.' });
    }
    emailsToProcess = allEmails;
  }

  const priorityEmojiMap: Record<string, string> = {
    urgent: '🔴',
    high: '🟠',
    normal: '🟡',
    low: '🟢'
  };

  for (const email of emailsToProcess) {
    try {
      const classification = await classifyEmail(email.subject, email.body || '');

      runExec(`
        UPDATE emails SET
          priority = ?,
          intent = ?,
          priority_emoji = ?,
          suggested_action = ?,
          auto_reply_eligible = ?,
          requires_human_review = ?,
          review_reason = ?,
          status = 'triaged'
        WHERE id = ?
      `, [
        classification.priority,
        classification.intent,
        priorityEmojiMap[classification.priority],
        classification.suggested_action || null,
        classification.auto_reply_eligible ? 1 : 0,
        classification.requires_human_review ? 1 : 0,
        classification.review_reason || null,
        email.id
      ]);

      emailsProcessed++;

      if (['job_offer', 'compliance_request', 'billing_alert', 'meeting_request'].includes(classification.intent)) {
        try {
          const existingDrafts = runQuery('SELECT id FROM drafts WHERE email_id = ?', [email.id]);
          if (existingDrafts.length === 0) {
            const draftResult = await generateDraft(
              email.subject,
              email.body || '',
              classification.intent,
              'professional'
            );

            const draftId = uuidv4();

            runExec(`
              INSERT INTO drafts (id, email_id, thread_id, subject, body, tone, quality_score, requires_human_review, status, original_subject, original_sender)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
            `, [
              draftId,
              email.id,
              email.thread_id,
              draftResult.subject,
              draftResult.body,
              draftResult.tone,
              draftResult.quality_score,
              classification.requires_human_review ? 1 : 0,
              email.subject,
              email.sender
            ]);

            runExec('UPDATE emails SET draft_id = ? WHERE id = ?', [draftId, email.id]);
            draftsCreated++;
          }
        } catch (draftError) {
          errors.push(`Failed to generate draft for email ${email.id}: ${draftError}`);
        }
      }

      if (['job_offer', 'compliance_request'].includes(classification.intent) && classification.priority !== 'low') {
        try {
          const existingFollowUps = runQuery('SELECT id FROM follow_ups WHERE email_id = ?', [email.id]);
          if (existingFollowUps.length === 0) {
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + 2);

            runExec(`
              INSERT INTO follow_ups (email_id, thread_id, follow_up_at, message, status)
              VALUES (?, ?, ?, ?, 'pending')
            `, [
              email.id,
              email.thread_id,
              followUpDate.toISOString(),
              `Follow up on ${classification.intent.replace('_', ' ')}`
            ]);

            followUpsScheduled++;
          }
        } catch (followUpError) {
          errors.push(`Failed to schedule follow-up for email ${email.id}: ${followUpError}`);
        }
      }
    } catch (emailError) {
      errors.push(`Failed to process email ${email.id}: ${emailError}`);
    }
  }

  saveDatabase();

  const durationSeconds = (Date.now() - startTime) / 1000;

  runExec(`
    INSERT INTO agent_logs (emails_processed, drafts_created, follow_ups_scheduled, errors, duration_seconds)
    VALUES (?, ?, ?, ?, ?)
  `, [emailsProcessed, draftsCreated, followUpsScheduled, errors.length > 0 ? JSON.stringify(errors) : null, durationSeconds]);

  saveDatabase();

  res.json({
    emails_processed: emailsProcessed,
    drafts_created: draftsCreated,
    follow_ups_scheduled: followUpsScheduled,
    duration_seconds: durationSeconds,
    errors
  });
}));

export default router;
