import { MessageCircle, MapPin } from 'lucide-react';
import { generateWhatsAppLink, generateDriverWhatsAppMessage } from '../../utils/whatsapp';

interface DriverInfoProps {
  name: string;
  phone: string;
  orderNumber: string;
}

export function DriverInfo({ name, phone, orderNumber }: DriverInfoProps) {
  const waLink = generateWhatsAppLink(phone, generateDriverWhatsAppMessage(orderNumber));

  return (
    <div className="card p-4 mt-4" id="driver-info">
      <h3 className="text-sm font-semibold text-secondary mb-3">🛵 Info Driver</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-secondary">{name}</p>
          <p className="text-xs text-gray-400 mt-0.5">📱 {phone}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-90 transition-transform"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <a
            href={`https://maps.google.com/?q=${name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center active:scale-90 transition-transform"
          >
            <MapPin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
