import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Wallet, ArrowRight } from 'lucide-react';
import { loadAccounts, saveAccounts, type Account } from '../../lib/storage';

const DEFAULT_ACCOUNTS: Account[] = [
  // Aset
  { id: '1', code: '1101', name: 'Kas', category: 'Aset', subCategory: 'Aset Lancar', balance: 0 },
  { id: '2', code: '1102', name: 'Bank', category: 'Aset', subCategory: 'Aset Lancar', balance: 0 },
  { id: '3', code: '1201', name: 'Piutang Usaha', category: 'Aset', subCategory: 'Aset Lancar', balance: 0 },
  { id: '4', code: '1301', name: 'Stok Bahan Baku', category: 'Aset', subCategory: 'Persediaan', balance: 0 },
  
  // Kewajiban
  { id: '5', code: '2101', name: 'Hutang Dagang', category: 'Kewajiban', subCategory: 'Kewajiban Lancar', balance: 0 },
  
  // Modal
  { id: '6', code: '3101', name: 'Modal Disetor', category: 'Modal', subCategory: 'Ekuitas', balance: 0 },
  { id: '7', code: '3201', name: 'Laba Ditahan', category: 'Modal', subCategory: 'Ekuitas', balance: 0 },
  
  // Pendapatan
  { id: '8', code: '4101', name: 'Penjualan Food & Beverage', category: 'Pendapatan', subCategory: 'Pendapatan Operasional', balance: 0 },
  
  // HPP
  { id: '9', code: '5101', name: 'Beban Bahan Baku', category: 'HPP', subCategory: 'HPP', balance: 0 },
  
  // Beban
  { id: '10', code: '6101', name: 'Gaji Karyawan', category: 'Beban', subCategory: 'Beban Operasional', balance: 0 },
  { id: '11', code: '6102', name: 'Sewa Tempat', category: 'Beban', subCategory: 'Beban Operasional', balance: 0 },
  { id: '12', code: '6103', name: 'Listrik / Air', category: 'Beban', subCategory: 'Beban Operasional', balance: 0 },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Aset': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Kewajiban': 'bg-amber-50 text-amber-700 border-amber-200',
  'Modal': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Pendapatan': 'bg-blue-50 text-blue-700 border-blue-200',
  'HPP': 'bg-rose-50 text-rose-700 border-rose-200',
  'Beban': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>(() => loadAccounts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const matchSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || 
                          acc.code.includes(search);
      const matchCategory = categoryFilter === 'Semua' || acc.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [accounts, search, categoryFilter]);

  const handleSaveAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAcc: Partial<Account> = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as Account['category'],
      subCategory: formData.get('subCategory') as string,
    };

    if (editingAccount) {
      const updated = accounts.map(a => a.id === editingAccount.id ? { ...a, ...newAcc } : a);
      setAccounts(updated);
      saveAccounts(updated);
    } else {
      const updated = [...accounts, { ...newAcc as Account, id: Date.now().toString(), balance: 0 }];
      setAccounts(updated);
      saveAccounts(updated);
    }
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari akun atau kode..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="Semua">Semua Kategori</option>
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all w-full md:w-auto justify-center"
        >
          <Plus size={18} /> Tambah Akun
        </button>
      </div>

      {/* Grid Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map(acc => (
          <div key={acc.id} className="glass-card p-5 group hover:border-primary/30 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${CATEGORY_COLORS[acc.category]}`}>
                {acc.category}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingAccount(acc); setIsModalOpen(true); }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-slate-400 leading-none">{acc.code}</p>
              <h4 className="font-headline font-bold text-slate-800 text-lg leading-tight">{acc.name}</h4>
              <p className="text-xs text-slate-400">{acc.subCategory}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo</p>
                <p className="text-xl font-black text-slate-900 leading-none mt-1">
                  Rp {acc.balance.toLocaleString('id-ID')}
                </p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="font-headline font-black text-xl text-slate-900">
                {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">Lengkapi detail informasi akun di bawah ini.</p>
            </div>

            <form onSubmit={handleSaveAccount} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kode Akun</label>
                  <input 
                    name="code"
                    required
                    defaultValue={editingAccount?.code}
                    placeholder="Contoh: 1101"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                  <select 
                    name="category"
                    required
                    defaultValue={editingAccount?.category}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer"
                  >
                    {Object.keys(CATEGORY_COLORS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Akun</label>
                <input 
                  name="name"
                  required
                  defaultValue={editingAccount?.name}
                  placeholder="Contoh: Kas Kecil Malang"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Sub-Kategori</label>
                <input 
                  name="subCategory"
                  required
                  defaultValue={editingAccount?.subCategory}
                  placeholder="Contoh: Aset Lancar"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
