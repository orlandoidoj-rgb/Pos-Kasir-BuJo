import { useState, useCallback } from 'react';
import { onlineApi } from '../services/online.api';
import { OnlineOrder, OnlineOrderStatus } from '../types/online-order';
import { printKitchenTicket } from '../utils/print';
import { KitchenTicketData } from '../types/receipt';
import { generateWhatsAppLink, getOrderWhatsAppMessage, getDriverWhatsAppMessage } from '../utils/whatsapp';
import { fmt } from '../utils/format';

export function useOnlineOrderActions(refresh: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = useCallback(async (order: OnlineOrder, action: string, payload?: any) => {
    setIsProcessing(true);
    try {
      switch (action) {
        case 'confirm':
          await onlineApi.updateStatus(order.id, 'Confirmed');
          
          // PHASE 5: Auto-print Kitchen Ticket
          const kitchenData: KitchenTicketData = {
            txId: order.orderNumber,
            date: new Date(),
            orderType: `ONLINE ${order.fulfillmentType.toUpperCase()}`,
            cashierName: 'POS System',
            customerName: order.customerName,
            items: order.items.map(i => ({
              name: i.productName,
              qty: i.qty,
              notes: i.notes,
            })),
            totalItems: order.items.reduce((s, i) => s + i.qty, 0),
          };
          printKitchenTicket(kitchenData);
          
          // Optional: Open WA to customer
          // window.open(generateWhatsAppLink(order.customerPhone, `Pesanan ${order.orderNumber} Anda telah kami konfirmasi dan sedang disiapkan.`));
          break;

        case 'prepare':
          await onlineApi.updateStatus(order.id, 'Preparing');
          break;

        case 'ready':
          await onlineApi.updateStatus(order.id, 'Ready');
          break;

        case 'complete':
          await onlineApi.updateStatus(order.id, 'Completed');
          break;

        case 'assign_driver':
          if (payload?.driverName && payload?.driverPhone) {
            await onlineApi.assignDriver(order.id, payload.driverName, payload.driverPhone, payload.driverId);

            // Open WA to driver
            const itemsSummary = order.items.map(i => `- ${i.qty}x ${i.productName}`).join('\n');
            const waMsg = getDriverWhatsAppMessage(
              order.orderNumber,
              order.customerName,
              order.deliveryAddress || '-',
              itemsSummary,
              fmt(order.total)
            );
            window.open(generateWhatsAppLink(payload.driverPhone, waMsg));
          }
          break;

        case 'cancel':
          if (payload?.reason) {
            await onlineApi.updateStatus(order.id, 'Cancelled', payload.reason);
          }
          break;

        case 'chat_customer':
          window.open(generateWhatsAppLink(order.customerPhone, getOrderWhatsAppMessage(order.orderNumber)));
          break;
          
        case 'chat_driver':
          if (order.driverPhone) {
            window.open(generateWhatsAppLink(order.driverPhone, `Halo Pak ${order.driverName}, bagaimana status pengantaran pesanan ${order.orderNumber}?`));
          }
          break;
      }
      
      refresh();
    } catch (err: any) {
      alert(`Gagal memproses aksi: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [refresh]);

  return {
    handleAction,
    isProcessing
  };
}
