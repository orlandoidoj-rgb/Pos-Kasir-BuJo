import { Router, Request, Response } from 'express';
import { handleMidtransNotification } from '../services/online-payment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const router = Router();

router.post('/midtrans/online', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any; // The real DB should be injected or imported
  // In our app, db might be imported from '../lib/db' or similar
  // Let's check where db comes from in other services.
  const result = await handleMidtransNotification(db, req.body);
  return sendSuccess(res, result);
}));

export default router;
