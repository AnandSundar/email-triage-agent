import { Router, Request, Response } from 'express';
import { getDatabase, runQuery, runExec, saveDatabase } from '../db/database';
import { FollowUp } from '../types';
import { asyncHandler } from '../middleware/asyncHandler';
import { followupFilterSchema, createFollowUpSchema, updateFollowUpSchema, validateQuery } from '../validation/schemas';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(followupFilterSchema)(req.query);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { status, limit, offset } = validation.data;

  const db = await getDatabase();
  let query = 'SELECT * FROM follow_ups WHERE 1=1';
  const params: any[] = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const countResult = runQuery(countQuery, params);
  const total = countResult[0]?.count || 0;

  query += ' ORDER BY follow_up_at ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const followUps = runQuery(query, params);
  res.json({ follow_ups: followUps, pagination: { limit, offset, total } });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validation = validateQuery(createFollowUpSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { email_id, thread_id, follow_up_at, message } = validation.data;

  const db = await getDatabase();
  const result = runExec(`
    INSERT INTO follow_ups (email_id, thread_id, follow_up_at, message, status)
    VALUES (?, ?, ?, ?, 'pending')
  `, [email_id, thread_id, follow_up_at, message || null]);

  saveDatabase();

  const followUps = runQuery('SELECT * FROM follow_ups WHERE id = ?', [result.lastInsertRowid]);
  const followUp = followUps[0] as FollowUp;
  res.status(201).json({ follow_up: followUp });
}));

router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const validation = validateQuery(updateFollowUpSchema)(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  const { status } = validation.data;

  const followUps = runQuery('SELECT * FROM follow_ups WHERE id = ?', [id]);

  if (followUps.length === 0) {
    return res.status(404).json({ error: 'Follow-up not found' });
  }

  runExec('UPDATE follow_ups SET status = ? WHERE id = ?', [status, id]);
  saveDatabase();

  const updatedFollowUps = runQuery('SELECT * FROM follow_ups WHERE id = ?', [id]);
  const updatedFollowUp = updatedFollowUps[0] as FollowUp;
  res.json({ follow_up: updatedFollowUp });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = await getDatabase();
  const { id } = req.params;

  const followUps = runQuery('SELECT * FROM follow_ups WHERE id = ?', [id]);

  if (followUps.length === 0) {
    return res.status(404).json({ error: 'Follow-up not found' });
  }

  runExec('DELETE FROM follow_ups WHERE id = ?', [id]);
  saveDatabase();
  res.status(204).send();
}));

export default router;
