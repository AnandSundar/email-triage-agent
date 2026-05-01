import { Router, Request, Response } from 'express';
import { getDatabase, runQuery, runExec, saveDatabase } from '../db/database';
import { Email } from '../types';
import { getMockEmails, mockEmailToEmail } from '../services/mockEmails';
import { classifyEmail } from '../services/aiService';
import { gmailService } from '../services/gmailService';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/asyncHandler';
import { emailFilterSchema, classifyEmailSchema, oauthCallbackSchema, validateQuery } from '../validation/schemas';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(emailFilterSchema)(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { priority, intent, status, limit, offset } = validation.data;

  const db = await getDatabase();
  let query = 'SELECT * FROM emails WHERE 1=1';
  const params: any[] = [];

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }
  if (intent) {
    query += ' AND intent = ?';
    params.push(intent);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const countResult = runQuery(countQuery, params);
  const total = countResult[0]?.count || 0;

  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const emails = runQuery(query, params);
  res.json({ emails, pagination: { limit, offset, total } });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const emails = runQuery('SELECT * FROM emails WHERE id = ?', [id]);
  const email = emails[0] as Email | undefined;

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json({ email });
}));

router.post('/fetch', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const demoMode = process.env.DEMO_MODE === 'true';

  if (demoMode) {
    const mockEmails = getMockEmails();
    const insertedEmails: Email[] = [];

    for (const mockEmail of mockEmails) {
      const email = mockEmailToEmail(mockEmail);

      runExec(`
        INSERT OR REPLACE INTO emails (id, thread_id, sender, sender_name, subject, body, snippet, timestamp, priority, intent, priority_emoji, auto_reply_eligible, requires_human_review, review_reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'triaged')
      `, [
        email.id,
        email.thread_id,
        email.sender,
        email.sender_name,
        email.subject,
        email.body,
        email.snippet,
        email.timestamp,
        email.priority,
        email.intent,
        email.priority_emoji,
        email.auto_reply_eligible ? 1 : 0,
        email.requires_human_review ? 1 : 0,
        email.review_reason || null
      ]);
      insertedEmails.push(email);
    }

    saveDatabase();

    res.json({ emails: insertedEmails, count: insertedEmails.length, source: 'demo' });
  } else {
    try {
      const authenticated = await gmailService.authenticate();
      if (!authenticated) {
        return res.status(401).json({
          error: 'Gmail not authenticated',
          auth_url: gmailService.getAuthUrl(),
          message: 'Please visit the auth_url to authorize the app, then call /api/emails/callback with the code'
        });
      }

      const gmailEmails = await gmailService.fetchUnreadEmails(20);
      const insertedEmails: Email[] = [];

      for (const email of gmailEmails) {
        runExec(`
          INSERT OR REPLACE INTO emails (id, thread_id, sender, sender_name, subject, body, snippet, timestamp, priority, intent, priority_emoji, auto_reply_eligible, requires_human_review, review_reason, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
        `, [
          email.id,
          email.thread_id,
          email.sender,
          email.sender_name,
          email.subject,
          email.body,
          email.snippet,
          email.timestamp,
          email.priority,
          email.intent,
          email.priority_emoji,
          email.auto_reply_eligible ? 1 : 0,
          email.requires_human_review ? 1 : 0,
          email.review_reason || null
        ]);
        insertedEmails.push(email);
      }

      saveDatabase();
      res.json({ emails: insertedEmails, count: insertedEmails.length, source: 'gmail' });
    } catch (gmailError) {
      console.error('Gmail fetch error:', gmailError);
      res.status(500).json({ error: 'Failed to fetch from Gmail', details: String(gmailError) });
    }
  }
}));

router.post('/:id/classify', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const validation = validateQuery(classifyEmailSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const emails = runQuery('SELECT * FROM emails WHERE id = ?', [id]);
  const email = emails[0] as Email | undefined;

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const classification = await classifyEmail(email.subject, email.body || '');

  const priorityEmojiMap: Record<string, string> = {
    urgent: '🔴',
    high: '🟠',
    normal: '🟡',
    low: '🟢'
  };

  runExec(`
    UPDATE emails SET
      priority = ?,
      intent = ?,
      priority_emoji = ?,
      suggested_action = ?,
      auto_reply_eligible = ?,
      requires_human_review = ?,
      review_reason = ?
    WHERE id = ?
  `, [
    classification.priority,
    classification.intent,
    priorityEmojiMap[classification.priority],
    classification.suggested_action || null,
    classification.auto_reply_eligible ? 1 : 0,
    classification.requires_human_review ? 1 : 0,
    classification.review_reason || null,
    id
  ]);

  saveDatabase();

  const updatedEmails = runQuery('SELECT * FROM emails WHERE id = ?', [id]);
  const updatedEmail = updatedEmails[0] as Email;

  res.json({ email: updatedEmail, classification });
}));

router.get('/auth', asyncHandler(async (req: Request, res: Response) => {
  const authUrl = gmailService.getAuthUrl();
  res.json({ auth_url: authUrl });
}));

router.post('/callback', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(oauthCallbackSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const success = await gmailService.getTokenFromCode(validation.data.code);
  if (success) {
    res.json({ message: 'Gmail authenticated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to authenticate with Gmail' });
  }
}));

export default router;
