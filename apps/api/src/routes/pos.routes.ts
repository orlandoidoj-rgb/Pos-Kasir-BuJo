import { Router, Request, Response } from 'express';
import { processPosCheckout } from '../services/pos-checkout.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';
import { branches } from '@warung-bujo/database';

const router = Router();

router.post('/checkout', asyncHandler(async (req: Request, res: Response) => {
  const result = await processPosCheckout(db, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

// GET /api/branches — returns all branches for POS login screen
router.get('/branches', asyncHandler(async (_req: Request, res: Response) => {
  const allBranches = await db.select().from(branches);
  const mapped = allBranches.map(b => ({
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    isHq: b.isHq,
    createdAt: b.createdAt,
  }));
  return sendSuccess(res, mapped);
}));

export default router;
