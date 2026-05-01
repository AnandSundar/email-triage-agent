import { Router, Request, Response } from 'express';
import { getDatabase, runQuery, runExec, saveDatabase } from '../db/database';
import { Draft } from '../types';
import { generateDraft } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/asyncHandler';
import { draftFilterSchema, createDraftSchema, generateDraftSchema, updateDraftSchema, validateQuery } from '../validation/schemas';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(draftFilterSchema)(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { status, limit, offset } = validation.data;

  const db = await getDatabase();
  let query = 'SELECT * FROM drafts WHERE 1=1';
  const params: any[] = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const countResult = runQuery(countQuery, params);
  const total = countResult[0]?.count || 0;

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const drafts = runQuery(query, params);
  res.json({ drafts, pagination: { limit, offset, total } });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const drafts = runQuery('SELECT * FROM drafts WHERE id = ?', [id]);
  const draft = drafts[0] as Draft | undefined;

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  res.json({ draft });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(createDraftSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { email_id, thread_id, subject, body, tone, requires_human_review } = validation.data;

  const db = await getDatabase();
  const id = uuidv4();

  runExec(`
    INSERT INTO drafts (id, email_id, thread_id, subject, body, tone, requires_human_review, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `, [id, email_id, thread_id, subject, body, tone, requires_human_review ? 1 : 0]);

  saveDatabase();

  const drafts = runQuery('SELECT * FROM drafts WHERE id = ?', [id]);
  const draft = drafts[0] as Draft;
  res.status(201).json({ draft });
}));

router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(generateDraftSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  const db = await getDatabase();
  const { email_id } = validation.data;

  const emails = runQuery('SELECT * FROM emails WHERE id = ?', [email_id]);

  if (emails.length === 0) {
    return res.status(404).json({ error: 'Email not found' });
  }

  const email = emails[0] as any;
  const draftResult = await generateDraft(
    email.subject,
    email.body || '',
    email.intent || 'general',
    'professional'
  );

  const id = uuidv4();

  runExec(`
    INSERT INTO drafts (id, email_id, thread_id, subject, body, tone, quality_score, requires_human_review, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pending')
  `, [
    id,
    email_id,
    email.thread_id,
    draftResult.subject,
    draftResult.body,
    draftResult.tone,
    draftResult.quality_score
  ]);

  runExec('UPDATE emails SET draft_id = ? WHERE id = ?', [id, email_id]);
  saveDatabase();

  const drafts = runQuery('SELECT * FROM drafts WHERE id = ?', [id]);
  const draft = drafts[0] as Draft;
  res.status(201).json({ draft });
}));

router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const validation = validateQuery(updateDraftSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { status, subject, body } = validation.data;

  const drafts = runQuery('SELECT * FROM drafts WHERE id = ?', [id]);

  if (drafts.length === 0) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);
  }
  if (subject) {
    updates.push('subject = ?');
    params.push(subject);
  }
  if (body) {
    updates.push('body = ?');
    params.push(body);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);
  runExec(`UPDATE drafts SET ${updates.join(', ')} WHERE id = ?`, params);
  saveDatabase();

  const updatedDrafts = runQuery('SELECT * FROM drafts WHERE id = ?', [id]);
  const updatedDraft = updatedDrafts[0] as Draft;
  res.json({ draft: updatedDraft });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const drafts = runQuery('SELECT * FROM drafts WHERE id = ?', [id]);

  if (drafts.length === 0) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  runExec('DELETE FROM drafts WHERE id = ?', [id]);
  saveDatabase();
  res.status(204).send();
}));

export default router;
