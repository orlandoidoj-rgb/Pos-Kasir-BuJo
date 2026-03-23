import { useState, useCallback, useMemo, useEffect } from 'react';
import { Screen, BranchInfo, TxRaw, OrderSetup } from '../types';
import { loadBranches, savePOSSession, clearPOSSession } from '../utils';
import { TX_STORAGE } from '../config';

export function useSession() {
  const [screen, setScreen] = useState<Screen>('login');
  const [cashierName, setCashierName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('CBG-001');
  const [branches, setBranches] = useState<BranchInfo[]>(loadBranches);
  
  const [orderSetup, setOrderSetup] = useState<OrderSetup>({
    orderType: 'Dine-in', 
    customerName: '', 
    customerPhone: '', 
    loyaltyCustomer: null, 
    discount: 0,
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryTx, setSelectedHistoryTx] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<TxRaw[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(TX_STORAGE) ?? '[]');
    } catch { return []; }
  });

  const selectedBranch = useMemo(() => branches.find(b => b.id === selectedBranchId), [branches, selectedBranchId]);

  const reloadAll = useCallback(() => {
    setBranches(loadBranches());
    try {
      setRecentTx(JSON.parse(localStorage.getItem(TX_STORAGE) ?? '[]'));
    } catch { setRecentTx([]); }
  }, []);

  const handleLogin = useCallback((bId: string, bName: string, cName: string) => {
    setSelectedBranchId(bId);
    setCashierName(cName);
    savePOSSession(bId, bName, cName);
    reloadAll();
    setScreen('setup');
  }, [reloadAll]);

  const handleTutupShift = useCallback(() => {
    clearPOSSession(selectedBranchId);
    setScreen('login');
  }, [selectedBranchId]);

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
    setSelectedHistoryTx(null);
  }, []);

  useEffect(() => {
    (window as any).toggleHistory = (tx?: any) => {
      if (tx) setSelectedHistoryTx(tx);
      setIsHistoryOpen(true);
    };
    return () => { delete (window as any).toggleHistory; };
  }, []);

  return {
    screen, setScreen,
    cashierName, setCashierName,
    selectedBranchId, setSelectedBranchId, 
    selectedBranch,
    branches, setBranches,
    orderSetup, setOrderSetup,
    isHistoryOpen, setIsHistoryOpen,
    selectedHistoryTx, setSelectedHistoryTx,
    recentTx, setRecentTx,
    handleLogin, handleTutupShift, closeHistory, reloadAll
  };
}
