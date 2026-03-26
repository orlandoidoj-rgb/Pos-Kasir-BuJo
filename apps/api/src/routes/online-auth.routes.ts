import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { eq, or } from 'drizzle-orm';
import { onlineCustomers } from '@warung-bujo/database';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { db } from '../lib/db';

const router = Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/online/auth/google
 * Body: { credential: string } — Google JWT from gsi/client
 */
router.post('/google', asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) throw new Error('credential wajib diisi');

  let payload: any;

  // If GOOGLE_CLIENT_ID not configured yet, allow test mode with decoded JWT (no verify)
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId || googleClientId.includes('GANTI')) {
    // Dev/test mode: decode without verify
    const parts = credential.split('.');
    if (parts.length === 3) {
      payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    } else {
      throw new Error('GOOGLE_CLIENT_ID belum dikonfigurasi');
    }
  } else {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    payload = ticket.getPayload();
  }

  if (!payload?.sub) throw new Error('Token Google tidak valid');

  const googleId = payload.sub;
  const email = payload.email || '';
  const name = payload.name || email.split('@')[0];
  const avatarUrl = payload.picture || null;

  // Find or create customer
  const existing = await db
    .select()
    .from(onlineCustomers)
    .where(or(
      eq(onlineCustomers.googleId, googleId),
      eq(onlineCustomers.email, email)
    ))
    .limit(1);

  let customer = existing[0];
  let needsProfile = false;

  if (!customer) {
    // Create new customer
    const [created] = await db
      .insert(onlineCustomers)
      .values({
        name,
        phone: `google_${googleId.slice(0, 10)}`, // Temp phone, will be updated in profile
        email,
        googleId,
        avatarUrl,
      })
      .returning();
    customer = created;
    needsProfile = true;
  } else {
    // Update google info if missing
    if (!customer.googleId) {
      await db
        .update(onlineCustomers)
        .set({ googleId, avatarUrl })
        .where(eq(onlineCustomers.id, customer.id));
    }
    // If phone is a temp google phone, needs profile
    needsProfile = !customer.phone || customer.phone.startsWith('google_');
  }

  const token = jwt.sign(
    { id: customer.id, email: customer.email, name: customer.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  return sendSuccess(res, {
    token,
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
    avatarUrl: customer.avatarUrl,
    needsProfile,
  });
}));

export default router;
