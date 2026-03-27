import { Router, Response } from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../services/categories.service';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: Response) => {
  const categories = await getCategories(db);
  return sendSuccess(res, categories);
}));

router.get('/:id', asyncHandler(async (req: any, res: Response) => {
  const category = await getCategoryById(db, req.params.id);
  if (!category) return sendError(res, 'NOT_FOUND', 'Kategori tidak ditemukan', undefined, 404);
  return sendSuccess(res, category);
}));

router.post('/', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name) return sendError(res, 'VALIDATION', 'Nama kategori wajib diisi');

  const category = await createCategory(db, { name });
  return sendSuccess(res, category, undefined, 201);
}));

router.put('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  const updated = await updateCategory(db, req.params.id, req.body);
  return sendSuccess(res, updated);
}));

router.delete('/:id', authMiddleware as any, requireRole('master', 'admin') as any, asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteCategory(db, req.params.id);
  return sendSuccess(res, { message: 'Kategori berhasil dihapus' });
}));

export default router;
