import { useRouter, useSearchParams } from 'next/navigation';

export function useHouseholdNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const openHouseholdDrawer = (householdId: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('household', householdId);
    router.push(`?${currentParams.toString()}`, { scroll: false });
  };

  const closeHouseholdDrawer = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('household');
    const newUrl = currentParams.toString()
      ? `?${currentParams.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  return {
    openHouseholdDrawer,
    closeHouseholdDrawer
  };
}
