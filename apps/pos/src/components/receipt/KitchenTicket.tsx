import React from 'react';
import { KitchenTicketData } from '../../types/receipt';

export default function KitchenTicket({ data }: { data: KitchenTicketData }) {
  const timeStr = data.date.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="receipt-container kitchen-ticket">
      <div className="receipt-header" style={{ fontSize: '16px' }}>
        ★★★ PESANAN DAPUR ★★★
      </div>
      
      <div className="receipt-divider" />
      
      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>#{data.txId}</div>
      <div>{timeStr} — {data.orderType}</div>
      <div>Kasir: {data.cashierName}</div>

      <div className="receipt-divider" style={{ borderStyle: 'solid', borderWidth: '2px 0 0 0' }} />

      {data.items.map((item, idx) => (
        <div key={idx} className="kitchen-item" style={{ display: 'flex', gap: '3mm', alignItems: 'flex-start' }}>
          <span className="kitchen-qty">{item.qty}x</span>
          <div style={{ flex: 1 }}>
            <div>{item.name}</div>
            {item.notes && (
              <div style={{ fontSize: '12px', fontWeight: 'normal', textTransform: 'none', fontStyle: 'italic', marginTop: '2px' }}>
                * {item.notes}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="receipt-divider" style={{ borderStyle: 'solid', borderWidth: '2px 0 0 0' }} />

      <div style={{ fontWeight: 'bold' }}>Total: {data.totalItems} item</div>
      {data.customerName && <div>Pelanggan: {data.customerName}</div>}

      <div className="receipt-divider" />

      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginTop: '2mm' }}>
        &gt;&gt; SEGERA SIAPKAN &lt;&lt;
      </div>
    </div>
  );
}
