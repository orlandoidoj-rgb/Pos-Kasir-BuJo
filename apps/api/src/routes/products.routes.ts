import { Router, Response } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  validateVoucher as validateProductVoucher,
} from '../services/products.service';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

// GET /api/products?branchId=xxx
router.get('/', asyncHandler(async (req: any, res: Response) => {
  const { branchId } = req.query;
  const products = await getProducts(db, branchId as string);
  return sendSuccess(res, products);
}));

router.get('/:id', asyncHandler(async (req: any, res: Response) => {
  const { branchId } = req.query;
  const product = await getProductById(db, req.params.id, branchId as string);
  if (!product) return sendError(res, 'NOT_FOUND', 'Produk tidak ditemukan', undefined, 404);
  return sendSuccess(res, product);
}));

// Admin routes
router.post('/', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, image, unit, price, purchasePrice, categoryId, isSellable, isRawMaterial } = req.body;

  if (!name) return sendError(res, 'VALIDATION', 'Nama produk wajib diisi');
  if (!price) return sendError(res, 'VALIDATION', 'Harga produk wajib diisi');
  if (!categoryId) return sendError(res, 'VALIDATION', 'Kategori produk wajib diisi');

  const product = await createProduct(db, {
    name, image, unit, price, purchasePrice, categoryId, isSellable, isRawMaterial
  });
  return sendSuccess(res, product, undefined, 201);
}));

router.put('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await updateProduct(db, req.params.id, req.body);
  return sendSuccess(res, updated);
}));

router.delete('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteProduct(db, req.params.id);
  return sendSuccess(res, { message: 'Produk berhasil dihapus' });
}));

export default router;
