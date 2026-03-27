import { Router, Response } from 'express';
import { getBranches, createBranch, updateBranch } from '../services/branches.service';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

// Admin only routes (except GET list)
router.get('/', asyncHandler(async (req: any, res: Response) => {
  const branches = await getBranches(db);
  return sendSuccess(res, branches);
}));

router.post('/', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, address, phone, isHq } = req.body;

  if (!name) return sendError(res, 'VALIDATION', 'Nama cabang wajib diisi');

  const branch = await createBranch(db, { name, address, phone, isHq });
  return sendSuccess(res, branch, undefined, 201);
}));

router.put('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await updateBranch(db, req.params.id, req.body);
  return sendSuccess(res, updated);
}));

export default router;
