import { useState, useEffect, useCallback, useRef } from 'react';
import { OnlineOrder } from '../types/online-order';
import { onlineApi } from '../services/online.api';
import { playOrderNotification } from '../utils/notification-sound';

export function useOnlineOrders(branchId: string) {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);
  
  const lastSeenIdRef = useRef<string | null>(localStorage.getItem('pos_last_seen_online_order'));
  const prevCountRef = useRef(0);

  const fetchOrders = useCallback(async (isSilent = true) => {
    if (!branchId) return;
    if (!isSilent) setIsLoading(true);
    
    try {
      // Get all active orders (not completed/cancelled)
      // Actually, fetching all and filtering in FE might be easier for multiple tabs
      const data = await onlineApi.getOrders(branchId);
      setOrders(data);
      
      const newPendingCount = data.filter(o => o.status === 'Paid').length;
      setPendingCount(newPendingCount);
      
      // Sound logic: if pending count increased
      if (newPendingCount > prevCountRef.current) {
        playOrderNotification();
      }
      prevCountRef.current = newPendingCount;

      // New badge logic: check if latest order ID is different from last seen
      const latestOrder = data.length > 0 ? data[0] : null; // Assuming sorted by date desc
      if (latestOrder && latestOrder.id !== lastSeenIdRef.current && latestOrder.status === 'Paid') {
        setHasNew(true);
      } else {
        setHasNew(false);
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch online orders:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const markAsSeen = () => {
    if (orders.length > 0) {
      const latestId = orders[0].id;
      localStorage.setItem('pos_last_seen_online_order', latestId);
      lastSeenIdRef.current = latestId;
      setHasNew(false);
    }
  };

  return {
    orders,
    pendingCount,
    hasNew,
    isLoading,
    error,
    refresh: () => fetchOrders(false),
    markAsSeen
  };
}
