import { Router, Request, Response } from 'express';
import { getDatabase, runQuery, saveDatabase } from '../db/database';
import { Analytics } from '../types';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();

    const emails = runQuery('SELECT * FROM emails', []);
    const drafts = runQuery('SELECT * FROM drafts', []);
    const followUps = runQuery('SELECT * FROM follow_ups', []);

    const emailsByPriority: Record<string, number> = {};
    const emailsByIntent: Record<string, number> = {};
    const emailsByStatus: Record<string, number> = {};
    const draftsByStatus: Record<string, number> = {};
    const followUpsByStatus: Record<string, number> = {};

    let autoReplyEligible = 0;
    let requiresHumanReview = 0;

    for (const email of emails) {
      emailsByPriority[email.priority] = (emailsByPriority[email.priority] || 0) + 1;
      emailsByIntent[email.intent] = (emailsByIntent[email.intent] || 0) + 1;
      emailsByStatus[email.status] = (emailsByStatus[email.status] || 0) + 1;

      if (email.auto_reply_eligible) autoReplyEligible++;
      if (email.requires_human_review) requiresHumanReview++;
    }

    for (const draft of drafts) {
      draftsByStatus[draft.status] = (draftsByStatus[draft.status] || 0) + 1;
    }

    for (const followUp of followUps) {
      followUpsByStatus[followUp.status] = (followUpsByStatus[followUp.status] || 0) + 1;
    }

    const analytics: Analytics = {
      total_emails: emails.length,
      emails_by_priority: emailsByPriority,
      emails_by_intent: emailsByIntent,
      emails_by_status: emailsByStatus,
      total_drafts: drafts.length,
      drafts_by_status: draftsByStatus,
      total_follow_ups: followUps.length,
      follow_ups_by_status: followUpsByStatus,
      auto_reply_eligible: autoReplyEligible,
      requires_human_review: requiresHumanReview
    };

    res.json({ analytics });
}));

export default router;