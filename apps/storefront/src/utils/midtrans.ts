const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-xxx';

let snapLoaded = false;

export function loadSnapJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (snapLoaded && (window as any).snap) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${MIDTRANS_SNAP_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => {
        snapLoaded = true;
        resolve();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload = () => {
      snapLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap'));
    document.head.appendChild(script);
  });
}

export interface SnapCallbacks {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

export async function payWithSnap(snapToken: string, callbacks: SnapCallbacks): Promise<void> {
  await loadSnapJs();
  const snap = (window as any).snap;
  if (!snap) throw new Error('Midtrans Snap not available');
  snap.pay(snapToken, callbacks);
}
