import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; phoneNumber: string; fullName: string; email?: string };
}

/**
 * Generic auth middleware — verifies JWT and attaches user to request
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak ditemukan' } });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = {
      id: payload.id,
      role: payload.role,
      phoneNumber: payload.phoneNumber,
      fullName: payload.fullName,
      email: payload.email,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid atau sudah kadaluarsa' } });
  }
}

/**
 * Role guard — only allows specific roles
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Anda tidak memiliki akses untuk operasi ini' } });
    }
    next();
  };
}
