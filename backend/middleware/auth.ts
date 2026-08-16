import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET || JWT_SECRET === 'CHANGE_ME_BEFORE_PRODUCTION') {
  console.error('[auth] FATAL ERROR: JWT_SECRET environment variable is missing or insecure.');
  process.exit(1);
}
export interface AuthRequest extends Request {
  user?: IUser;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
          return;
        }
        req.user = user;
        next();
      })
      .catch(() => {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
      });
  } catch {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
