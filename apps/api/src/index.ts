import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import posRoutes from './routes/pos.routes';
import inventoryRoutes from './routes/inventory.routes';
import procurementRoutes from './routes/procurement.routes';
import onlineStoreRoutes from './routes/online-store.routes';
import onlineCustomerRoutes from './routes/online-customer.routes';
import onlineAdminRoutes from './routes/online-admin.routes';
import onlineWebhookRoutes from './routes/online-webhook.routes';
import onlineAuthRoutes from './routes/online-auth.routes';
import driverRoutes from './routes/driver.routes';
import { sendSuccess } from './utils/response';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  return sendSuccess(res, { status: 'OK', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', posRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api', procurementRoutes);
app.use('/api/online', onlineStoreRoutes);
app.use('/api/online/auth', onlineAuthRoutes);
app.use('/api/online/customer', onlineCustomerRoutes);
app.use('/api/admin/online', onlineAdminRoutes);
app.use('/api/webhooks', onlineWebhookRoutes);
app.use('/api/driver', driverRoutes);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
