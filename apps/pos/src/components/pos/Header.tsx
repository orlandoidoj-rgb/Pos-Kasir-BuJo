import React from 'react';
import { ChefHat, Clock, RefreshCw, LogOut } from 'lucide-react';
import { BranchInfo } from '../../types';
import OnlineOrderBadge from '../online/OnlineOrderBadge';

interface HeaderProps {
  selectedBranch?: BranchInfo;
  cashierName: string;
  setIsHistoryOpen: (val: boolean) => void;
  reloadAll: () => void;
  handleTutupShift: () => void;
  onlineOrderCount: number;
  hasNewOnlineOrder: boolean;
  onOpenOnlineOrders: () => void;
}

export default function Header({
  selectedBranch,
  cashierName,
  setIsHistoryOpen,
  reloadAll,
  handleTutupShift,
  onlineOrderCount,
  hasNewOnlineOrder,
  onOpenOnlineOrders
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 shadow-sm z-30">
       <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
               <ChefHat size={20} />
             </div>
             <div>
               <p className="font-headline font-black text-lg leading-tight">Warung BuJo</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{selectedBranch?.nama}</p>
             </div>
          </div>
       </div>

       <div className="flex items-center gap-4">
          <OnlineOrderBadge 
            count={onlineOrderCount}
            hasNew={hasNewOnlineOrder}
            onClick={onOpenOnlineOrders}
          />

          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl mr-2">
             <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black uppercase">
               {cashierName.charAt(0)}
             </div>
             <span className="text-xs font-bold text-emerald-800">{cashierName}</span>
          </div>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/10 transition-all outline-none"
          >
             <Clock size={16} /> Riwayat
          </button>
          <button 
            onClick={reloadAll} 
            className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all outline-none active:rotate-180 duration-500" 
            title="Sync Data"
          >
             <RefreshCw size={18} />
          </button>
          <div className="h-6 w-px bg-gray-100 mx-1"></div>
          <button 
            onClick={handleTutupShift} 
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-all outline-none"
          >
             <LogOut size={16} /> Tutup
          </button>
       </div>
    </header>
  );
}
