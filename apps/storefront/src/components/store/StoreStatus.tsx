import React from 'react';
import { Badge } from '../ui/Badge';

interface StoreStatusProps {
  isOpen: boolean;
  closingTime?: string;
}

export const StoreStatus: React.FC<StoreStatusProps> = ({ isOpen, closingTime }) => {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOpen ? 'success' : 'danger'}>
        {isOpen ? '🟢 Buka' : '🔴 Tutup'}
      </Badge>
      {isOpen && closingTime && (
        <span className="text-xs text-gray-400 font-medium">Tutup pukul {closingTime}</span>
      )}
    </div>
  );
};
