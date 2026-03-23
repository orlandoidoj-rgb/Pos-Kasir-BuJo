import React from 'react';
import { CustomerReceiptData } from '../../types/receipt';
import { fmt } from '../../utils';

export default function CustomerReceipt({ data }: { data: CustomerReceiptData }) {
  const dateStr = data.date.toLocaleString('id-ID', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <div>★ {data.storeName.toUpperCase()} ★</div>
        <div style={{ fontWeight: 'normal', fontSize: '11px' }}>{data.branchName}</div>
        {data.branchAddress && <div style={{ fontWeight: 'normal', fontSize: '10px' }}>{data.branchAddress}</div>}
        {data.branchPhone && <div style={{ fontWeight: 'normal', fontSize: '10px' }}>Telp: {data.branchPhone}</div>}
      </div>
      
      <div className="receipt-divider" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px' }}>
        <div>Kasir</div><div>: {data.cashierName}</div>
        <div>Cabang</div><div>: {data.branchName}</div>
        <div>Tgl</div><div>: {dateStr}</div>
        <div>No</div><div>: {data.txId}</div>
        <div>Tipe</div><div>: {data.orderType}</div>
      </div>

      <div className="receipt-divider" />

      {data.items.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '2mm' }}>
          <div className="receipt-item-name">{item.name}</div>
          <div className="receipt-item-detail">
            <span>{item.qty} x {item.price.toLocaleString('id-ID')}</span>
            <span>{item.subtotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      ))}

      <div className="receipt-divider" />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Subtotal</span>
        <span>{data.subtotal.toLocaleString('id-ID')}</span>
      </div>
      {(data.discount > 0 || data.voucherDiscount) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Diskon</span>
          <span>-{Math.max(data.discount, data.voucherDiscount || 0).toLocaleString('id-ID')}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>PPN</span>
        <span>{data.tax.toLocaleString('id-ID')}</span>
      </div>

      <div className="receipt-divider" />

      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2mm 0' }}>
        <span className="receipt-total">TOTAL</span>
        <span className="receipt-total">{fmt(data.total)}</span>
      </div>

      <div className="receipt-divider" />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Bayar ({data.paymentMethod})</span>
        <span>{fmt(data.amountPaid)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Kembali</span>
        <span>{fmt(data.change)}</span>
      </div>

      <div className="receipt-divider" />

      {(data.customerName || data.customerPhone) && (
        <div style={{ marginTop: '2mm', marginBottom: '2mm' }}>
          {data.customerName && <div>Pelanggan: {data.customerName}</div>}
          {data.customerPhone && <div>No. HP: {data.customerPhone}</div>}
          {data.pointsEarned !== undefined && data.pointsEarned > 0 && (
            <div>Poin: +{data.pointsEarned} {data.totalPoints ? `(Total: ${data.totalPoints})` : ''}</div>
          )}
        </div>
      )}

      {(data.customerName || data.customerPhone) && <div className="receipt-divider" />}

      <div style={{ textAlign: 'center', marginTop: '4mm' }}>
        <div>Terima Kasih! 🙏</div>
        <div>Selamat Menikmati</div>
      </div>
      
      <div className="receipt-divider" style={{ borderStyle: 'double', borderWidth: '3px 0 0 0' }} />
      <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '1mm' }}>
        Powered by Warung BuJo POS
      </div>
    </div>
  );
}
