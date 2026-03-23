import React from 'react';
import { ShoppingCart, Search, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface HeaderProps {
  storeName: string;
  logo?: string;
}

export const Header: React.FC<HeaderProps> = ({ storeName, logo }) => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <Link to={`/${slug}`} className="flex items-center gap-3">
        {logo ? (
          <img src={logo} alt={storeName} className="w-10 h-10 rounded-xl object-cover" />
        ) : (
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
            {storeName.charAt(0)}
          </div>
        )}
        <h1 className="font-bold text-lg text-gray-900 tracking-tight">{storeName}</h1>
      </Link>

      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Search size={22} />
        </button>
        <Link to={`/${slug}/orders`} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <User size={22} />
        </Link>
      </div>
    </header>
  );
};
