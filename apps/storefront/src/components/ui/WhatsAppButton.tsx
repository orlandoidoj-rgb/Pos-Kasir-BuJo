import React from 'react';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppLink } from '../../utils/whatsapp';

export const WhatsAppButton: React.FC<{ phone: string }> = ({ phone }) => {
  return (
    <a
      href={generateWhatsAppLink(phone, "Halo Warung BuJo, saya ingin bertanya...")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-[40] bg-[#25D366] text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
};
