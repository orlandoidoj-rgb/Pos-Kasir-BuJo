import { CustomerReceiptData, KitchenTicketData } from '../types/receipt';

// Global variables to store current print data for the PrintContainer to pick up
export let currentCustomerData: CustomerReceiptData | null = null;
export let currentKitchenData: KitchenTicketData | null = null;

// Listeners to notify React to re-render the PrintContainer
let printListeners: (() => void)[] = [];

export function subscribeToPrint(listener: () => void) {
  printListeners.push(listener);
  return () => {
    printListeners = printListeners.filter(l => l !== listener);
  };
}

function notifyPrintListeners() {
  printListeners.forEach(l => l());
}

/**
 * Trigger print browser dialog
 */
export function printReceipt(elementId: string): void {
  // We don't actually need elementId for window.print() if we use @media print cleverly,
  // but we keep the signature for semantic value.
  window.print();
}

/**
 * Shortcut: render CustomerReceipt ke hidden container dan print
 */
export function printCustomerReceipt(data: CustomerReceiptData): void {
  currentCustomerData = data;
  currentKitchenData = null;
  notifyPrintListeners();
  
  // Berikan waktu React untuk re-render dom sebelum memanggil window.print()
  setTimeout(() => {
    window.print();
  }, 100);
}

/**
 * Shortcut: render KitchenTicket ke hidden container dan print
 */
export function printKitchenTicket(data: KitchenTicketData): void {
  currentCustomerData = null;
  currentKitchenData = data;
  notifyPrintListeners();

  setTimeout(() => {
    window.print();
  }, 100);
}

/**
 * Print customer receipt dan kitchen ticket berurutan
 * (dengan delay kecil antara keduanya agar printer tidak hang)
 */
export async function printBoth(
  customerData: CustomerReceiptData,
  kitchenData: KitchenTicketData
): Promise<void> {
  // Print customer struk terlebih dahulu
  currentCustomerData = customerData;
  currentKitchenData = null;
  notifyPrintListeners();
  
  await new Promise(resolve => setTimeout(resolve, 100)); // wait render
  window.print();

  // Print kitchen ticket
  await new Promise(resolve => setTimeout(resolve, 800)); // wait printer
  
  currentCustomerData = null;
  currentKitchenData = kitchenData;
  notifyPrintListeners();

  await new Promise(resolve => setTimeout(resolve, 100)); // wait render
  window.print();
}
