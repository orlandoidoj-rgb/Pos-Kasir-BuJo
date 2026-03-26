import { Router, Request, Response } from 'express';
import { processPosCheckout } from '../services/pos-checkout.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

router.post('/checkout', asyncHandler(async (req: Request, res: Response) => {
  const result = await processPosCheckout(db, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

export default router;
