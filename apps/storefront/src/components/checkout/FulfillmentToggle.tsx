import React from 'react';
import { Store, Truck } from 'lucide-react';
import { clsx } from 'clsx';

interface FulfillmentToggleProps {
  active: "pickup" | "delivery";
  onChange: (val: "pickup" | "delivery") => void;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
}

export const FulfillmentToggle: React.FC<FulfillmentToggleProps> = ({ 
  active, 
  onChange,
  deliveryEnabled,
  pickupEnabled 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Pengambilan</h3>
      
      <div className="flex gap-3">
        {pickupEnabled && (
          <button
            onClick={() => onChange("pickup")}
            className={clsx(
              "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
              active === "pickup" ? "border-primary bg-primary/5 text-primary" : "border-gray-100 text-gray-400"
            )}
          >
            <Store size={24} />
            <span className="font-bold text-sm">Ambil Sendiri</span>
          </button>
        )}

        {deliveryEnabled && (
          <button
            onClick={() => onChange("delivery")}
            className={clsx(
              "flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
              active === "delivery" ? "border-primary bg-primary/5 text-primary" : "border-gray-100 text-gray-400"
            )}
          >
            <Truck size={24} />
            <span className="font-bold text-sm">Delivery</span>
          </button>
        )}
      </div>
    </div>
  );
};
