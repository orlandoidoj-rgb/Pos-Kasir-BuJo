import { Router, Request, Response } from 'express';
import { getAdminOrders, updateOrderStatus, assignOrderDriver } from '../services/online-order.service';
import { assignDriverToOrder, getDriversByBranch, createDriver, updateDriver, deleteDriver } from '../services/driver.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

// ── Order endpoints ───────────────────────────────────────────────────────────

router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  const { branchId, status, date } = req.query;
  const result = await getAdminOrders(db, {
    branchId: branchId as string,
    status: status as string,
    date: date as string
  });
  return sendSuccess(res, result);
}));

router.put('/orders/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { status, notes, changedBy } = req.body;
  const result = await updateOrderStatus(db, req.params.id, status, changedBy || 'admin', notes);
  return sendSuccess(res, result);
}));

// Assign driver by driverId (new) or driverName+driverPhone (legacy)
router.put('/orders/:id/assign-driver', asyncHandler(async (req: Request, res: Response) => {
  const { driverId, driverName, driverPhone } = req.body;
  if (driverId) {
    const result = await assignDriverToOrder(db, req.params.id, driverId);
    return sendSuccess(res, result);
  }
  const result = await assignOrderDriver(db, req.params.id, driverName, driverPhone);
  return sendSuccess(res, result);
}));

// ── Driver management endpoints ───────────────────────────────────────────────

router.get('/drivers', asyncHandler(async (req: Request, res: Response) => {
  const { branchId } = req.query;
  if (!branchId) throw new Error('branchId wajib diisi');
  const result = await getDriversByBranch(db, branchId as string);
  return sendSuccess(res, result);
}));

router.post('/drivers', asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, branchId } = req.body;
  if (!name || !phone || !branchId) throw new Error('name, phone, branchId wajib diisi');
  const result = await createDriver(db, { name, phone, email, branchId });
  return sendSuccess(res, result);
}));

router.put('/drivers/:id', asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, status } = req.body;
  const result = await updateDriver(db, req.params.id, { name, phone, email, status });
  return sendSuccess(res, result);
}));

router.delete('/drivers/:id', asyncHandler(async (req: Request, res: Response) => {
  await deleteDriver(db, req.params.id);
  return sendSuccess(res, { success: true });
}));

export default router;
