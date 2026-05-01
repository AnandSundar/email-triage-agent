import { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.API_KEY;

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!API_KEY) {
    console.warn('API_KEY not configured - auth disabled');
    return next();
  }

  const providedKey = req.headers['x-api-key'];

  if (!providedKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  if (providedKey !== API_KEY) {
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  next();
}
