import React from 'react';
import { OrderStatus } from '../../types/order';
import { Check, Clock, Package, ChefHat, Truck, Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
}

const STEPS = [
  { status: 'Paid', label: 'Dibayar', icon: Check },
  { status: 'Confirmed', label: 'Dikonfirmasi', icon: Package },
  { status: 'Preparing', label: 'Disiapkan', icon: ChefHat },
  { status: 'Ready', label: 'Siap', icon: Star },
  { status: 'Out for Delivery', label: 'Diantar', icon: Truck },
  { status: 'Completed', label: 'Selesai', icon: Check },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  const getStatusIndex = (status: string) => STEPS.findIndex(s => s.status === status);
  const currentIndex = getStatusIndex(currentStatus);

  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
        <Clock size={20} />
        Pesanan dibatalkan
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connector Line */}
      <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100" />
      <div 
        className="absolute left-6 top-4 w-0.5 bg-primary transition-all duration-1000" 
        style={{ height: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%` }}
      />

      <div className="space-y-8 relative z-10">
        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={idx} className="flex items-center gap-4">
              <div 
                className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                  isDone ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white border-2 border-gray-100 text-gray-300"
                )}
              >
                <StepIcon size={20} strokeWidth={isCurrent ? 3 : 2} />
              </div>
              <div>
                <p className={clsx(
                  "text-sm font-black uppercase tracking-widest",
                  isDone ? "text-gray-900" : "text-gray-300"
                )}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[10px] text-primary font-bold uppercase animate-pulse">Sedang diproses</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
