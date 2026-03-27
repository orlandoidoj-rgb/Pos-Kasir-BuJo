import { Router, Response } from 'express';
import {
  getVouchers,
  getActiveVouchers,
  validateVoucherCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../services/vouchers.service';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

// Public routes
router.get('/', asyncHandler(async (req: any, res: Response) => {
  const vouchers = await getVouchers(db);
  return sendSuccess(res, vouchers);
}));

router.get('/active', asyncHandler(async (req: any, res: Response) => {
  const vouchers = await getActiveVouchers(db);
  return sendSuccess(res, vouchers);
}));

router.post('/validate', asyncHandler(async (req: any, res: Response) => {
  const { code, subtotal, branchId } = req.body;

  if (!code) return sendError(res, 'VALIDATION', 'Kode voucher wajib diisi');
  if (!subtotal) return sendError(res, 'VALIDATION', 'Subtotal wajib diisi');

  const result = await validateVoucherCode(db, code, Number(subtotal), branchId);
  return sendSuccess(res, result);
}));

// Admin routes
router.post('/', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, discountType, value, quota, validUntil } = req.body;

  if (!code) return sendError(res, 'VALIDATION', 'Kode voucher wajib diisi');
  if (!discountType) return sendError(res, 'VALIDATION', 'Tipe diskon wajib diisi');
  if (!value) return sendError(res, 'VALIDATION', 'Nilai diskon wajib diisi');

  const voucher = await createVoucher(db, { code, discountType, value, quota, validUntil });
  return sendSuccess(res, voucher, undefined, 201);
}));

router.put('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await updateVoucher(db, req.params.id, req.body);
  return sendSuccess(res, updated);
}));

router.delete('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteVoucher(db, req.params.id);
  return sendSuccess(res, { message: 'Voucher berhasil dihapus' });
}));

export default router;
