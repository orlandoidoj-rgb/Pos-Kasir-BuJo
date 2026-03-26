import { Router, Request, Response } from 'express';
import { handleMidtransNotification } from '../services/online-payment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

router.post('/midtrans/online', asyncHandler(async (req: Request, res: Response) => {
  const result = await handleMidtransNotification(db, req.body);
  return sendSuccess(res, result);
}));

export default router;
