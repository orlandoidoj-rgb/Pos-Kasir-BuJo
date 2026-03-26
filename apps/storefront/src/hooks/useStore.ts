import { useState, useEffect } from 'react';
import { StoreInfo } from '@/types/store';
import { getStore } from '@/services/store.api';
import { DUMMY_STORE } from '@/constants/dummy-data';

export function useStore(slug: string) {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    setIsLoading(true);
    getStore(slug)
      .then(setStore)
      .catch(err => {
        console.warn(`Failed to fetch store for slug: ${slug}`, err);
        if (slug === 'malang-pusat') {
          setStore(DUMMY_STORE);
          setError(null);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  const isOpen = (store: StoreInfo | null): boolean => {
    if (!store || !store.isEnabled) return false;
    if (!store.operatingHours) return true;

    const now = new Date();
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = days[now.getDay()];
    const hours = store.operatingHours[today];

    if (!hours) return false;

    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= hours.open && currentTime <= hours.close;
  };

  return {
    store,
    isLoading,
    error,
    isOpen: isOpen(store)
  };
}
