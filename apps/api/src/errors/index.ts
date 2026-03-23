export class AppError extends Error {
  code: string;
  statusCode: number;
  details?: any[];

  constructor(message: string, code: string, statusCode: number, details?: any[]) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InsufficientStockError extends AppError {
  constructor(details: any[]) {
    super("Stok bahan baku tidak mencukupi", "INSUFFICIENT_STOCK", 422, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Input tidak valid", details?: any[]) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Data tidak ditemukan") {
    super(message, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Akses ditolak. Silahkan login kembali.") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Akses dibatasi.") {
    super(message, "FORBIDDEN", 403);
  }
}

export class OrderAlreadyPaidError extends AppError {
  constructor() {
    super("Order ini sudah dibayar", "ORDER_ALREADY_PAID", 422);
  }
}

export class VoucherExpiredError extends AppError {
  constructor() {
    super("Voucher telah kadaluarsa", "VOUCHER_EXPIRED", 422);
  }
}

export class VoucherQuotaEmptyError extends AppError {
  constructor() {
    super("Kuota voucher telah habis", "VOUCHER_QUOTA_EMPTY", 422);
  }
}

export class TransferInvalidError extends AppError {
  constructor(message: string = "Transfer stok tidak valid") {
    super(message, "TRANSFER_INVALID", 422);
  }
}
