import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface DriverRequest extends Request {
  driver?: { id: string; name: string; phone: string; branchId: string };
}

export function driverAuth(req: DriverRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak ditemukan' } });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.driver = { id: payload.id, name: payload.name, phone: payload.phone, branchId: payload.branchId };
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token tidak valid' } });
  }
}
