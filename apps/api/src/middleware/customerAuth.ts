import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CustomerRequest extends Request {
  customer?: { id: string; email: string; name: string };
}

export function customerAuth(req: CustomerRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak ditemukan' } });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.customer = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid' } });
  }
}
