import { Router, Request, Response } from 'express';
import { getAdminOrders, updateOrderStatus, assignOrderDriver } from '../services/online-order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const { branchId, status, date } = req.query;
  const result = await getAdminOrders(db, { 
    branchId: branchId as string, 
    status: status as string, 
    date: date as string 
  });
  return sendSuccess(res, result);
}));

router.put('/orders/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const { status, notes, changedBy } = req.body;
  const result = await updateOrderStatus(db, req.params.id, status, changedBy || 'admin', notes);
  return sendSuccess(res, result);
}));

router.put('/orders/:id/assign-driver', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const { driverName, driverPhone } = req.body;
  const result = await assignOrderDriver(db, req.params.id, driverName, driverPhone);
  return sendSuccess(res, result);
}));

export default router;
