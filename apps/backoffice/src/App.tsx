import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Wallet,
  ChevronDown,
  RefreshCw,
  Plus,
  UserCog,
  Bell,
  Settings,
  ShoppingBag,
  Search,
  Gift,
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import Inventory from './pages/Inventory';
import CRM from './pages/CRM';
import Finance from './pages/Finance';
import UsersPage from './pages/Users';
import Products from './pages/Products';
import Loyalty from './pages/Loyalty';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { to: '/branches',  icon: Store,           label: 'Cabang & Users'           },
  { to: '/products',  icon: ShoppingBag,     label: 'Produk & Resep'           },
  { to: '/inventory', icon: Package,         label: 'Inventory'                },
  { to: '/crm',       icon: Users,           label: 'CRM / Partners'           },
  { to: '/finance',   icon: Wallet,          label: 'Finance / Jurnal'         },
  { to: '/loyalty',   icon: Gift,            label: 'Voucher / Loyalty'        },
  { to: '/users',     icon: UserCog,         label: 'User Management'          },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':          { title: 'Dashboard',          subtitle: 'Ringkasan performa bisnis hari ini'             },
  '/branches':  { title: 'Cabang & Users',     subtitle: 'Manajemen lokasi dan pengguna per cabang'       },
  '/products':  { title: 'Produk & Resep',    subtitle: 'Katalog menu, harga, dan resep BOM produk'     },
  '/inventory': { title: 'Inventory',          subtitle: 'Stok bahan baku, pengadaan, dan distribusi'    },
  '/crm':       { title: 'CRM / Partners',     subtitle: 'Kelola supplier dan pelanggan bisnis'           },
  '/finance':   { title: 'Finance / Jurnal',   subtitle: 'Laporan keuangan & pembukuan double-entry'      },
  '/loyalty':   { title: 'Voucher & Loyalty',  subtitle: 'Manajemen voucher, promo, dan program poin pelanggan' },
  '/users':     { title: 'User Management',    subtitle: 'Hak akses berdasarkan peran pengguna'           },
};

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageTitles[location.pathname] ?? { title: 'Backoffice', subtitle: '' };
  const isProductsPage = location.pathname === '/products';

  const handleProdukBaru = () => {
    if (isProductsPage) {
      navigate('/products?add=1');
    } else {
      navigate('/products?add=1');
    }
  };

  return (
    <header className="fixed top-0 right-0 left-56 h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 z-20">
      <div className="flex items-center gap-10">
        <div className="hidden lg:flex items-center bg-slate-50 rounded-2xl px-5 py-2.5 w-[450px] border border-slate-100 focus-within:border-primary/30 focus-within:bg-white transition-all">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search analytics, products, or reports..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-body"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
          <button className="relative p-2.5 rounded-2xl hover:bg-slate-50 text-slate-500 transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2.5 rounded-2xl hover:bg-slate-50 text-slate-500 transition-all">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="font-headline font-bold text-sm text-slate-900 leading-none">Darmawan Saputra</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">CFO Office</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
            alt="Executive" 
            className="w-11 h-11 rounded-2xl object-cover shadow-sm border-2 border-white"
          />
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <nav className="w-56 fixed top-0 left-0 bottom-0 bg-[#f7f9fb] border-r border-slate-100 flex flex-col py-6 z-30">
      {/* Logo */}
      <div className="mb-8 px-5 flex items-center gap-3">
        <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-primary/20 shrink-0">
          W
        </div>
        <div>
          <p className="font-headline font-black text-slate-900 text-base leading-tight">Warung</p>
          <p className="text-xs text-slate-400 font-medium leading-tight">BuJo Backoffice</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-500 hover:bg-white hover:text-primary hover:shadow-sm'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={2.5} className="shrink-0" />
                <span className={`text-[15px] font-semibold leading-tight ${isActive ? 'text-white' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom user action */}
      <div className="px-3">
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all">
          <UserCog size={22} strokeWidth={2.5} className="shrink-0" />
          <span className="text-[15px] font-semibold">Profil Akun</span>
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/backoffice">
      <div className="flex h-screen w-full bg-white overflow-hidden font-body">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-56">
          <Header />
          <main className="flex-1 overflow-y-auto pt-28 px-10 pb-10 bg-[#f7f9fb]">
            <div className="max-w-[1600px] mx-auto">
              <Routes>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/branches"  element={<Branches />} />
                <Route path="/products"  element={<Products />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/crm"       element={<CRM />} />
                <Route path="/finance"   element={<Finance />} />
                <Route path="/loyalty"   element={<Loyalty />} />
                <Route path="/users"     element={<UsersPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
