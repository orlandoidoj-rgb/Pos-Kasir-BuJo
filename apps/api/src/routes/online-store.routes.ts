import { Router, Request, Response } from 'express';
import { getStoreBySlug, getStoreMenu } from '../services/online-store.service';
import { createOnlineOrder } from '../services/online-store.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const result = await getStoreBySlug(db, req.params.slug);
  return sendSuccess(res, result);
}));

router.get('/:slug/menu', asyncHandler(async (req: Request, res: Response) => {
  const store = await getStoreBySlug(db, req.params.slug);
  if (!store) throw new Error("Store not found");

  const result = await getStoreMenu(db, store.branchId, req.query.categoryId as string);
  return sendSuccess(res, result);
}));

router.post('/:slug/checkout', asyncHandler(async (req: Request, res: Response) => {
  const store = await getStoreBySlug(db, req.params.slug);
  if (!store) throw new Error("Store not found");

  const result = await createOnlineOrder(db, store.branchId, req.params.slug, req.body);
  return sendSuccess(res, result, undefined, 201);
}));

export default router;
