import { Router, Response } from 'express';
import { getAllUsers, getUserById, createStaffUser, updateUser, deleteUser } from '../services/admin-users.service';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

// All admin-users routes require admin or master role
router.use(authMiddleware as any, requireRole('master', 'admin') as any);

/**
 * GET /api/admin/users?role=customer&search=query
 */
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role, search } = req.query as { role?: string; search?: string };
  const result = await getAllUsers(db, { role, search });
  return sendSuccess(res, result);
}));

/**
 * GET /api/admin/users/:id
 */
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await getUserById(db, req.params.id);
  if (!user) return sendError(res, 'NOT_FOUND', 'User tidak ditemukan', undefined, 404);
  return sendSuccess(res, user);
}));

/**
 * POST /api/admin/users
 * Body: { fullName, phoneNumber, email?, password, role: 'cashier'|'admin', branchId? }
 */
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fullName, phoneNumber, password, email, role, branchId } = req.body;

  if (!fullName) return sendError(res, 'VALIDATION', 'Nama lengkap wajib diisi');
  if (!phoneNumber) return sendError(res, 'VALIDATION', 'Nomor HP wajib diisi');
  if (!password || password.length < 6) return sendError(res, 'VALIDATION', 'Password minimal 6 karakter');
  if (!['cashier', 'admin'].includes(role)) return sendError(res, 'VALIDATION', 'Role harus cashier atau admin');

  const user = await createStaffUser(db, { fullName, phoneNumber, email, password, role, branchId });
  return sendSuccess(res, user, undefined, 201);
}));

/**
 * PUT /api/admin/users/:id
 * Body: { fullName?, phoneNumber?, email?, role?, branchId?, points? }
 */
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await updateUser(db, req.params.id, req.body);
  return sendSuccess(res, updated);
}));

/**
 * DELETE /api/admin/users/:id
 */
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteUser(db, req.params.id);
  return sendSuccess(res, { message: 'User berhasil dihapus' });
}));

export default router;
