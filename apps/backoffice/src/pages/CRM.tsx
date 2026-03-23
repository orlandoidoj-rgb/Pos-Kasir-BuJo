import { useState } from 'react';
import { Users, Truck, Star, Plus, Search, Phone, Mail, MoreHorizontal } from 'lucide-react';

type PartnerType = 'supplier' | 'customer';

interface Partner {
  id: string;
  nama: string;
  tipe: PartnerType;
  kontak: string;
  email: string;
  kota: string;
  totalTransaksi: string;
  totalRaw: number;
  status: 'active' | 'inactive';
  rating: number;
  lastOrder: string;
}

const partners: Partner[] = [
  { id: 'SUP-001', nama: 'CV Maju Bersama', tipe: 'supplier', kontak: '081234567890', email: 'cv.maju@email.com', kota: 'Malang', totalTransaksi: 'Rp 8,4M', totalRaw: 8400000, status: 'active', rating: 5, lastOrder: '2026-03-18' },
  { id: 'SUP-002', nama: 'Toko Sembako Jaya', tipe: 'supplier', kontak: '082345678901', email: 'sembako.jaya@email.com', kota: 'Surabaya', totalTransaksi: 'Rp 3,2M', totalRaw: 3200000, status: 'active', rating: 4, lastOrder: '2026-03-15' },
  { id: 'SUP-003', nama: 'PT Bahan Pangan Nusantara', tipe: 'supplier', kontak: '083456789012', email: 'bpn@email.com', kota: 'Jakarta', totalTransaksi: 'Rp 12,1M', totalRaw: 12100000, status: 'active', rating: 5, lastOrder: '2026-03-19' },
  { id: 'CST-001', nama: 'Kantin Universitas Brawijaya', tipe: 'customer', kontak: '085678901234', email: 'kantin@ub.ac.id', kota: 'Malang', totalTransaksi: 'Rp 4,5M', totalRaw: 4500000, status: 'active', rating: 4, lastOrder: '2026-03-17' },
  { id: 'CST-002', nama: 'Catering Bu Dewi', tipe: 'customer', kontak: '087890123456', email: 'catering.dewi@email.com', kota: 'Malang', totalTransaksi: 'Rp 2,1M', totalRaw: 2100000, status: 'active', rating: 3, lastOrder: '2026-03-10' },
  { id: 'CST-003', nama: 'Restoran Sari Rasa', tipe: 'customer', kontak: '089012345678', email: 'sarirasa@email.com', kota: 'Surabaya', totalTransaksi: 'Rp 6,8M', totalRaw: 6800000, status: 'inactive', rating: 4, lastOrder: '2026-02-28' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );
}

export default function CRM() {
  const [filter, setFilter] = useState<'all' | PartnerType>('all');
  const [search, setSearch] = useState('');

  const filtered = partners.filter(p => {
    const matchType = filter === 'all' || p.tipe === filter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kota.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const supplierCount = partners.filter(p => p.tipe === 'supplier').length;
  const customerCount = partners.filter(p => p.tipe === 'customer').length;
  const activeCount = partners.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        <div className="glass-card p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
            <Truck size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Supplier</p>
            <p className="text-3xl font-black text-slate-800">{supplierCount}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Users size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer</p>
            <p className="text-3xl font-black text-slate-800">{customerCount}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Star size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Aktif</p>
            <p className="text-3xl font-black text-slate-800">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['all', 'supplier', 'customer'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'supplier' ? 'Supplier' : 'Customer'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari partner..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 transition-all w-52 placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm shadow-indigo-200 active:scale-95 transition-all">
            <Plus size={15} />
            Tambah Partner
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(partner => (
          <div
            key={partner.id}
            className={`glass-card p-5 hover:shadow-md transition-shadow ${partner.status === 'inactive' ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  partner.tipe === 'supplier' ? 'bg-amber-50' : 'bg-indigo-50'
                }`}>
                  {partner.tipe === 'supplier'
                    ? <Truck size={19} className="text-amber-600" />
                    : <Users size={19} className="text-indigo-600" />
                  }
                </div>
                <div>
                  <p className="font-bold text-slate-800">{partner.nama}</p>
                  <p className="text-[11px] font-mono text-slate-400">{partner.id} · {partner.kota}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                  partner.tipe === 'supplier'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {partner.tipe}
                </span>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all">
                  <MoreHorizontal size={15} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={partner.rating} />
              <span className="text-xs text-slate-400">({partner.rating}/5)</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Phone size={11} className="text-slate-400" /> {partner.kontak}
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Mail size={11} className="text-slate-400 shrink-0" />
                <span className="truncate">{partner.email}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Transaksi</p>
                <p className="text-base font-black text-indigo-700">{partner.totalTransaksi}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Last Order</p>
                <p className="text-sm font-semibold text-slate-600">{partner.lastOrder}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                partner.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {partner.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Users size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">Tidak ada partner ditemukan.</p>
        </div>
      )}
    </div>
  );
}
