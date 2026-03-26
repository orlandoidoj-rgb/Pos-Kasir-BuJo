import { OrderStatus } from '../../types/order';
import { formatTime } from '../../utils/format';
import { Check, Circle } from 'lucide-react';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: string;
  timestamp?: string;
}

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: Record<string, string>;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: 'Paid', label: 'Dibayar', icon: '💳' },
  { status: 'Confirmed', label: 'Dikonfirmasi', icon: '✅' },
  { status: 'Preparing', label: 'Dimasak', icon: '🍳' },
  { status: 'Ready', label: 'Siap', icon: '✨' },
  { status: 'Out for Delivery', label: 'Diantar', icon: '🛵' },
  { status: 'Completed', label: 'Selesai', icon: '🟢' },
];

const STATUS_ORDER: OrderStatus[] = ['Pending', 'Paid', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Completed'];

export function StatusTimeline({ currentStatus, statusHistory }: StatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-0" id="status-timeline">
      {TIMELINE_STEPS.map((step, i) => {
        const stepIndex = STATUS_ORDER.indexOf(step.status);
        const isCompleted = stepIndex <= currentIndex && stepIndex > 0;
        const isCurrent = step.status === currentStatus;
        const isPending = stepIndex > currentIndex;
        const timestamp = statusHistory?.[step.status];

        return (
          <div key={step.status} className="flex gap-3">
            {/* Line + Dot */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${isCompleted && !isCurrent ? 'bg-success text-white' : ''}
                ${isCurrent ? 'bg-primary text-white animate-pulse-dot' : ''}
                ${isPending ? 'bg-gray-100 text-gray-300' : ''}
              `}>
                {isCompleted && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="text-sm">{step.icon}</span>
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              {/* Connecting line */}
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-8 ${stepIndex < currentIndex ? 'bg-success' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 pt-1">
              <p className={`text-sm font-semibold ${
                isCurrent ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-gray-300'
              }`}>
                {step.label}
              </p>
              {timestamp && (
                <p className="text-xs text-gray-400 mt-0.5">{formatTime(timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
