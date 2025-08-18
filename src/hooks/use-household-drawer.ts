'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useHouseholdDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    const householdParam = searchParams.get('household');
    if (householdParam) {
      setHouseholdId(householdParam);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setHouseholdId(null);
    }
  }, [searchParams]);

  const openHousehold = (id: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('household', id);
    router.push(`?${currentParams.toString()}`, { scroll: false });
  };

  const closeHousehold = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('household');
    const newUrl = currentParams.toString()
      ? `?${currentParams.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  return {
    isOpen,
    householdId,
    openHousehold,
    closeHousehold
  };
}
