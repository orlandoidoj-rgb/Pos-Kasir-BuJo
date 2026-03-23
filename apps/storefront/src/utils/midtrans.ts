/**
 * loadSnapScript
 * Loads Midtrans Snap.js dynamically.
 */
export async function loadSnapScript(clientKey: string, isProduction: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded
    if ((window as any).snap) {
      resolve();
      return;
    }

    const scriptUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Midtrans Snap script"));

    document.head.appendChild(script);
  });
}

/**
 * openSnapPopup
 * Opens the Midtrans Snap payment popup.
 */
export function openSnapPopup(
  snapToken: string,
  callbacks: {
    onSuccess: (result: any) => void;
    onPending: (result: any) => void;
    onError: (result: any) => void;
    onClose: () => void;
  }
) {
  if (!(window as any).snap) {
    console.error("Snap.js is not loaded yet");
    return;
  }

  (window as any).snap.pay(snapToken, {
    onSuccess: callbacks.onSuccess,
    onPending: callbacks.onPending,
    onError: callbacks.onError,
    onClose: callbacks.onClose,
  });
}
