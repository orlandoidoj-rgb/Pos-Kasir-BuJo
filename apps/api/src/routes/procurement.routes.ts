import { Router, Request, Response } from 'express';
import { createPurchaseOrder } from '../services/procurement.service';
import { createStockTransfer } from '../services/transfer.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const router = Router();

router.post('/procurement', asyncHandler(async (req: Request, res: Response) => {
  const db = {}; // Placeholder
  const result = await createPurchaseOrder(db, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

router.post('/transfers', asyncHandler(async (req: Request, res: Response) => {
  const db = {}; // Placeholder
  const result = await createStockTransfer(db, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

export default router;
