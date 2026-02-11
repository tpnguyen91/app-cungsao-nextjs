'use client';

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { MemberSearchModal } from './member-search-modal';
import { useHouseholdDrawer } from '@/hooks/use-household-drawer';

export function MemberSearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openHousehold } = useHouseholdDrawer();

  return (
    <>
      <Button
        onClick={() => setIsSearchOpen(true)}
        variant='outline'
        className='cursor-pointer gap-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800'
      >
        <Search className='h-4 w-4' />
        Tìm thành viên
      </Button>

      <MemberSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMember={(member) => openHousehold(member.household_id)}
      />
    </>
  );
}
