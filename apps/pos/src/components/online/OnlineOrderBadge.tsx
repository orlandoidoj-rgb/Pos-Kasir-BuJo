import React from 'react';
import { Bell } from 'lucide-react';

interface OnlineOrderBadgeProps {
  count: number;
  hasNew: boolean;
  onClick: () => void;
}

export default function OnlineOrderBadge({ count, hasNew, onClick }: OnlineOrderBadgeProps) {
  if (count === 0) return null;

  return (
    <button 
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all outline-none
        ${hasNew 
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse' 
          : 'bg-blue-500 text-white shadow-lg shadow-blue-200'}
      `}
    >
      <Bell size={16} fill={hasNew ? 'currentColor' : 'none'} />
      <span>{count} Order Online</span>
      {hasNew && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-rose-500 rounded-full animate-ping"></span>
      )}
    </button>
  );
}
