import { useCartContext, useStoreContext } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Search, User, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  cartCount?: number;
  onSearch?: (query: string) => void;
  transparent?: boolean;
}

export function Header({
  title,
  showBack = false,
  showSearch = true,
  showCart = true,
  showProfile = false,
  cartCount = 0,
  onSearch,
  transparent = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={`
        sticky top-0 z-30 transition-all duration-300
        ${transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
        }
      `}
      id="header"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
        {/* Back button */}
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
            id="back-button"
          >
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </button>
        )}

        {/* Title or Search */}
        {searchOpen ? (
          <div className="flex-1 relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="input pl-10 pr-4 py-2.5 text-sm"
              autoFocus
              id="search-input"
            />
          </div>
        ) : (
          <div className="flex-1">
            {title && (
              <h1 className="text-base font-bold text-secondary truncate">{title}</h1>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showSearch && !searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
              id="search-toggle"
            >
              <Search className="w-5 h-5 text-secondary" />
            </button>
          )}

          {searchOpen && (
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); onSearch?.(''); }}
              className="text-sm font-medium text-primary px-2 py-1"
            >
              Batal
            </button>
          )}

          {showProfile && (
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
              id="profile-button"
            >
              <User className="w-5 h-5 text-secondary" />
            </button>
          )}

          {showCart && (
            <button
              onClick={() => navigate(`/${slug}/cart`)}
              className="relative w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center active:scale-95 transition-transform"
              id="cart-button"
            >
              <ShoppingCart className="w-5 h-5 text-secondary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
