import { POS_SESSION_KEY } from '../config';

export function savePOSSession(branchId: string, branchName: string, cashierName: string) {
  try {
    const sessions = JSON.parse(localStorage.getItem(POS_SESSION_KEY) ?? '{}');
    sessions[branchId] = { branchId, branchName, cashierName, loginAt: new Date().toISOString(), active: true };
    localStorage.setItem(POS_SESSION_KEY, JSON.stringify(sessions));
  } catch { /* ignore */ }
}

export function clearPOSSession(branchId: string) {
  try {
    const sessions = JSON.parse(localStorage.getItem(POS_SESSION_KEY) ?? '{}');
    if (sessions[branchId]) sessions[branchId] = { ...sessions[branchId], active: false };
    localStorage.setItem(POS_SESSION_KEY, JSON.stringify(sessions));
  } catch { /* ignore */ }
}
