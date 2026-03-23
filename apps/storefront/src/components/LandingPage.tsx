import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white mb-8 shadow-2xl shadow-primary/20">
        <ShoppingBag size={48} strokeWidth={2.5} />
      </div>
      
      <h1 className="text-4xl font-black text-gray-900 text-center mb-4 tracking-tight">Warung BuJo <br/><span className="text-primary italic">Online Store</span></h1>
      <p className="text-gray-500 text-center mb-12 leading-relaxed">Nikmati menu spesial kami langsung dari genggaman Anda. Tanpa komisi platform, harga lebih hemat!</p>

      <div className="w-full space-y-4">
        <Link to="/pusat" className="block">
          <button className="w-full bg-gray-50 hover:bg-gray-100 p-6 rounded-3xl border border-gray-100 flex items-center justify-between transition-all active:scale-95 group">
            <div className="text-left">
              <p className="font-black text-gray-900 group-hover:text-primary transition-colors">Cabang Pusat</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Jl. Borobudur No. 22</p>
            </div>
            <div className="bg-success/10 text-success text-[10px] font-black px-2 py-1 rounded-full">BUKA</div>
          </button>
        </Link>
      </div>

      <p className="mt-20 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Powered by BuJo POS System</p>
    </div>
  );
};
