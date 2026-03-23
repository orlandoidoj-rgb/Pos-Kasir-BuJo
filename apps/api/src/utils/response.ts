import { Response } from 'express';

export interface MetaData {
  page?: number;
  limit?: number;
  total?: number;
  cursor?: string;
  [key: string]: any;
}

export function sendSuccess(res: Response, data: any, meta?: MetaData, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta })
  });
}

export function sendError(
  res: Response, 
  code: string, 
  message: string, 
  details?: any[], 
  statusCode: number = 400
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
}
