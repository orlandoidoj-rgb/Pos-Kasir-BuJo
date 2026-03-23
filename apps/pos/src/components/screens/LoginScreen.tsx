import React from 'react';
import { ChefHat, Store, User, ChevronRight, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { BranchInfo } from '../../types';

interface LoginScreenProps {
  branches: BranchInfo[];
  onLogin: (branchId: string, branchName: string, cashierName: string) => void;
}

export default function LoginScreen({ branches, onLogin }: LoginScreenProps) {
  const activeBranches = branches.filter(b => b.status === 'active');
  const [branchId, setBranchId] = React.useState(() => {
    const p = activeBranches.find(b => b.isOwnerPrimary);
    return p?.id ?? activeBranches[0]?.id ?? 'CBG-001';
  });
  const [cashierName, setCashierName] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = () => {
    if (!cashierName.trim()) { setError('Masukkan nama kasir terlebih dahulu'); return; }
    const branch = activeBranches.find(b => b.id === branchId);
    onLogin(branchId, branch?.nama ?? branchId, cashierName.trim());
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-[#224ceb] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#224ceb]/30 mx-auto mb-6">
            <ChefHat className="text-white w-12 h-12" />
          </div>
          <h1 className="font-headline font-black text-4xl text-gray-900">Warung BuJo</h1>
          <p className="text-gray-400 font-semibold text-lg mt-1">Terminal Kasir POS</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <h2 className="font-headline font-black text-2xl text-gray-900 mb-1">Buka Shift</h2>
            <p className="text-gray-400 text-base">Pilih cabang dan masukkan nama kasir</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">Cabang</label>
            <div className="relative">
              <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#224ceb]" />
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-base font-semibold text-gray-700 outline-none focus:border-[#224ceb] focus:ring-2 focus:ring-[#224ceb]/10 transition-all appearance-none cursor-pointer"
              >
                {activeBranches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nama}{b.isOwnerPrimary ? ' (Utama)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">Nama Kasir</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={cashierName}
                onChange={e => { setCashierName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Masukkan nama Anda..."
                className={`w-full bg-gray-50 border rounded-2xl pl-12 pr-5 py-4 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 ${
                  error ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-1.5 font-semibold">{error}</p>}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full bg-[#224ceb] text-white font-headline font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-xl shadow-lg shadow-[#224ceb]/25 active:scale-95 transition-all"
          >
            <Coffee size={22} />
            Buka Shift
            <ChevronRight size={22} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
