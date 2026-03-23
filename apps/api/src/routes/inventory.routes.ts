import { Router, Request, Response } from 'express';
import { getInventoryStock, getLowStockAlerts } from '../services/inventory.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const db = {}; // Placeholder
  const { branchId, cursorDate, limit } = req.query;
  const result = await getInventoryStock(
    db, 
    branchId as string | undefined, 
    cursorDate as string | undefined, 
    limit ? Number(limit) : 50
  );
  return sendSuccess(res, result);
}));

router.get('/alerts', asyncHandler(async (req: Request, res: Response) => {
  const db = {}; // Placeholder
  const { branchId } = req.query;
  const result = await getLowStockAlerts(db, branchId as string | undefined);
  return sendSuccess(res, result);
}));

export default router;
