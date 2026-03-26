import { OrderStatus } from '../../types/order';

const STATUS_CONFIG: Record<OrderStatus, { className: string; label: string; icon: string }> = {
  Pending:            { className: 'status-pending', label: 'Menunggu Bayar', icon: '⏳' },
  Paid:               { className: 'status-paid', label: 'Dibayar', icon: '💳' },
  Confirmed:          { className: 'status-confirmed', label: 'Dikonfirmasi', icon: '✅' },
  Preparing:          { className: 'status-preparing', label: 'Sedang Dimasak', icon: '🍳' },
  Ready:              { className: 'status-ready', label: 'Siap', icon: '✨' },
  'Out for Delivery': { className: 'status-delivery', label: 'Diantar', icon: '🛵' },
  Completed:          { className: 'status-completed', label: 'Selesai', icon: '🟢' },
  Cancelled:          { className: 'status-cancelled', label: 'Dibatalkan', icon: '❌' },
};

interface BadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: BadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  return (
    <span className={`
      badge ${config.className}
      ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
    `}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}

interface SimpleBadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'green' | 'red' | 'blue' | 'gray' | 'success'; 
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'orange', size = 'md', className }: SimpleBadgeProps) {
  const variants = {
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-emerald-100 text-emerald-700',
    success: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
  };

  const sizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
  };

  return (
    <span className={`badge inline-flex items-center font-bold rounded-md ${variants[variant]} ${sizes[size]} ${className || ''}`}>
      {children}
    </span>
  );
}

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}
