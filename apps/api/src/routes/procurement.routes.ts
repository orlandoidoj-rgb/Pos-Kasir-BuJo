import { Router, Request, Response } from 'express';
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
} from '../services/procurement.service';
import { createStockTransfer } from '../services/transfer.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

// GET /api/procurement?status=Received,Completed&branchId=xxx
router.get('/procurement', asyncHandler(async (req: Request, res: Response) => {
  const { status, branchId } = req.query;
  const statuses = status ? (status as string).split(',') : undefined;
  const orders = await getPurchaseOrders(db, statuses, branchId as string);
  return sendSuccess(res, orders);
}));

// GET /api/procurement/:id
router.get('/procurement/:id', asyncHandler(async (req: Request, res: Response) => {
  const po = await getPurchaseOrderById(db, req.params.id);
  if (!po) {
    return sendError(res, 'NOT_FOUND', 'Purchase Order tidak ditemukan', undefined, 404);
  }
  return sendSuccess(res, po);
}));

router.post('/procurement', asyncHandler(async (req: Request, res: Response) => {
  const result = await createPurchaseOrder(db, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

router.post('/transfers', asyncHandler(async (req: Request, res: Response) => {
  const result = await createStockTransfer(db, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

export default router;
