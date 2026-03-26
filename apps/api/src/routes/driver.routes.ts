import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  loginDriver,
  getDriverById,
  getDriverOrders,
  getDriverOrderHistory,
  setDriverStatus,
  completeDriverDelivery,
} from '../services/driver.service';
import { driverAuth, DriverRequest } from '../middleware/driverAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

/**
 * POST /api/driver/login
 * Body: { phone: string }
 * No password for V1 — driver must be registered by admin first
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) throw new Error('Nomor HP wajib diisi');

  const driver = await loginDriver(db, phone);
  if (!driver) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Driver tidak ditemukan. Hubungi admin untuk mendaftar.' }
    });
  }

  const token = jwt.sign(
    { id: driver.id, name: driver.name, phone: driver.phone, branchId: driver.branchId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  return sendSuccess(res, { token, driver: { id: driver.id, name: driver.name, phone: driver.phone, status: driver.status } });
}));

/**
 * GET /api/driver/me
 */
router.get('/me', driverAuth, asyncHandler(async (req: DriverRequest, res: Response) => {
  const driver = await getDriverById(db, req.driver!.id);
  if (!driver) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Driver tidak ditemukan' } });
  return sendSuccess(res, driver);
}));

/**
 * PUT /api/driver/status
 * Body: { status: 'available' | 'offline' }
 */
router.put('/status', driverAuth, asyncHandler(async (req: DriverRequest, res: Response) => {
  const { status } = req.body;
  if (!['available', 'offline'].includes(status)) throw new Error('Status harus available atau offline');
  const driver = await setDriverStatus(db, req.driver!.id, status);
  return sendSuccess(res, driver);
}));

/**
 * GET /api/driver/orders
 * Returns active orders (Out for Delivery) for this driver
 */
router.get('/orders', driverAuth, asyncHandler(async (req: DriverRequest, res: Response) => {
  const orders = await getDriverOrders(db, req.driver!.id);
  return sendSuccess(res, orders);
}));

/**
 * GET /api/driver/history
 * Returns today's completed orders
 */
router.get('/history', driverAuth, asyncHandler(async (req: DriverRequest, res: Response) => {
  const orders = await getDriverOrderHistory(db, req.driver!.id);
  return sendSuccess(res, orders);
}));

/**
 * PUT /api/driver/orders/:id/complete
 */
router.put('/orders/:id/complete', driverAuth, asyncHandler(async (req: DriverRequest, res: Response) => {
  const result = await completeDriverDelivery(db, req.driver!.id, req.params.id);
  return sendSuccess(res, result);
}));

export default router;
