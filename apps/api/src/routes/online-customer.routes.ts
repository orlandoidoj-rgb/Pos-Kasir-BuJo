import { Router, Request, Response } from 'express';
import { 
  registerOrFindCustomer,
  getCustomerById,
  updateCustomerAddress
} from '../services/online-customer.service';
import { getCustomerOrders, getOrderDetails } from '../services/online-order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const router = Router();

/**
 * POST /api/online/customer/register
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any; // Placeholder
  const { name, phone, email } = req.body;
  
  if (!name || !phone || !email) {
    throw new Error("Nama, nomor HP, dan email wajib diisi");
  }

  const result = await registerOrFindCustomer(db, name, phone, email);
  return sendSuccess(res, result);
}));

/**
 * GET /api/online/customer/:id
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const result = await getCustomerById(db, req.params.id);
  if (!result) throw new Error("Customer tidak ditemukan");
  return sendSuccess(res, result);
}));

/**
 * PUT /api/online/customer/:id/address
 */
router.put('/:id/address', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const { address, addressNote } = req.body;
  await updateCustomerAddress(db, req.params.id, address, addressNote);
  return sendSuccess(res, { success: true });
}));

/**
 * GET /api/online/customer/:id/orders
 */
router.get('/:id/orders', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const result = await getCustomerOrders(db, req.params.id);
  return sendSuccess(res, result);
}));

/**
 * GET /api/online/customer/orders/:id
 */
router.get('/orders/:id', asyncHandler(async (req: Request, res: Response) => {
  const db = {} as any;
  const result = await getOrderDetails(db, req.params.id);
  return sendSuccess(res, result);
}));

export default router;
