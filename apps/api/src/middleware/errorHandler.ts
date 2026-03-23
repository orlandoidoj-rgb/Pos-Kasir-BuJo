import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { sendError } from '../utils/response';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.details, err.statusCode);
  }

  // Postgres / Drizzle Error Mapping
  if (err.code === "23505") { // unique_violation
    return sendError(res, "DUPLICATE_ENTRY", "Data sudah ada (Duplikat)", undefined, 409);
  }
  if (err.code === "23503") { // foreign_key_violation
    return sendError(res, "REFERENCE_ERROR", "Data referensi tidak ditemukan di sistem database", undefined, 422);
  }

  // Payload SyntaxError Check
  if (err instanceof SyntaxError && 'body' in err) {
    return sendError(res, "VALIDATION_ERROR", "Format payload tidak valid (Invalid JSON)", undefined, 400);
  }

  // Fallback 500
  console.error("[System Error Fallback Stack]:", err);
  return sendError(res, "INTERNAL_ERROR", "Terjadi kesalahan tidak terduga di server", undefined, 500);
}
