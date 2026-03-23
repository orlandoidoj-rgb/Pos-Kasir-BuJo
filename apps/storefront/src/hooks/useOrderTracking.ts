import { useState, useEffect } from 'react';
import { OnlineOrder } from '../types/order';
import { getOrder } from '../services/order.api';

export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<OnlineOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchOrder = async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);
        setIsLoading(false);

        // Stop polling if status is terminal
        const terminalStatuses = ["Completed", "Cancelled"];
        if (data && terminalStatuses.includes(data.status)) {
          clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchOrder(); // Initial fetch
    interval = setInterval(fetchOrder, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  return { order, isLoading, error };
}
