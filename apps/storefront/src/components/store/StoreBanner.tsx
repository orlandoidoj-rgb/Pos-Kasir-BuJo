import React from 'react';
import { StoreInfo } from '../../types/store';
import { MapPin, Clock } from 'lucide-react';

interface StoreBannerProps {
  store: StoreInfo;
}

export const StoreBanner: React.FC<StoreBannerProps> = ({ store }) => {
  return (
    <div className="relative">
      <div className="h-48 w-full bg-gray-200">
        {store.bannerImage ? (
          <img src={store.bannerImage} alt={store.storeName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-primary/20 font-bold text-4xl">Warung BuJo</span>
          </div>
        )}
      </div>
      
      <div className="px-4 -mt-10 relative z-10">
        <div className="bg-white p-5 rounded-3xl shadow-xl shadow-gray-200/50">
          <h2 className="text-2xl font-black text-gray-900 mb-1">{store.storeName}</h2>
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">{store.description || 'Pusat kuliner nikmat dengan harga sahabat.'}</p>
          
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <MapPin size={16} className="text-primary" />
              <span>Malang, Jawa Timur</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <Clock size={16} className="text-primary" />
              <span>{store.estimatedPrepTime || 15} min prep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
