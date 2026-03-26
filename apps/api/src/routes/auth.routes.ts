import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { registerUser, loginByPhone, loginByGoogle } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { phoneNumber, fullName, password, email?, role? }
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, fullName, password, email, role } = req.body;

  if (!phoneNumber) return sendError(res, 'VALIDATION', 'Nomor HP wajib diisi');
  if (!fullName) return sendError(res, 'VALIDATION', 'Nama lengkap wajib diisi');
  if (!password || password.length < 6) return sendError(res, 'VALIDATION', 'Password minimal 6 karakter');

  const user = await registerUser(db, { phoneNumber, fullName, password, email, role });

  const token = jwt.sign(
    { id: user.id, role: user.role, phoneNumber: user.phoneNumber, fullName: user.fullName, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return sendSuccess(res, {
    token,
    user: {
      id: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      points: user.points,
    },
  }, undefined, 201);
}));

/**
 * POST /api/auth/login
 * Body: { phoneNumber, password }
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber) return sendError(res, 'VALIDATION', 'Nomor HP wajib diisi');
  if (!password) return sendError(res, 'VALIDATION', 'Password wajib diisi');

  const user = await loginByPhone(db, phoneNumber, password);

  const token = jwt.sign(
    { id: user.id, role: user.role, phoneNumber: user.phoneNumber, fullName: user.fullName, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return sendSuccess(res, {
    token,
    user: {
      id: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      points: user.points,
    },
  });
}));

/**
 * POST /api/auth/google
 * Body: { credential } — Google JWT
 */
router.post('/google', asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) return sendError(res, 'VALIDATION', 'Google credential wajib diisi');

  const user = await loginByGoogle(db, credential);

  const token = jwt.sign(
    { id: user.id, role: user.role, phoneNumber: user.phoneNumber, fullName: user.fullName, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return sendSuccess(res, {
    token,
    user: {
      id: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      points: user.points,
      googleId: user.googleId,
    },
    needsProfile: !user.phoneNumber,
  });
}));

export default router;
