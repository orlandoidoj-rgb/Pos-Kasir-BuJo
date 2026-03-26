import { Router, Response } from 'express';
import { getCustomerSyncData } from '../services/customer-sync.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

/**
 * GET /api/customer/sync
 * Returns: profile, points, active vouchers
 * Auth: Bearer token required
 */
router.get('/sync', authMiddleware as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const data = await getCustomerSyncData(db, userId);
  return sendSuccess(res, data);
}));

export default router;
