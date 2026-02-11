'use client';

import { HouseholdsTable } from '@/components/households/households-table';
import { LogoutButton } from '@/components/layout/logout-button';
import { MemberSearchModal } from '@/components/family-members/member-search-modal';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import { useState } from 'react';
import { useHouseholdDrawer } from '@/hooks/use-household-drawer';

interface HouseholdsPageContentProps {
  householdsWithCount: any[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchText: string;
  provinceFilter: string;
  wardFilter: string;
}

export function HouseholdsPageContent({
  householdsWithCount,
  totalCount,
  currentPage,
  pageSize,
  searchText,
  provinceFilter,
  wardFilter
}: HouseholdsPageContentProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openHousehold } = useHouseholdDrawer();

  return (
    <div className='bg-background flex h-screen flex-col p-6'>
      <div className='mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 overflow-hidden'>
        {/* Header */}
        <div className='flex shrink-0 items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
              <Home className='text-primary h-5 w-5' />
            </div>
            <div>
              <h1 className='text-foreground text-lg font-semibold'>
                Quản lý hộ gia đình
              </h1>
              <p className='text-muted-foreground text-sm'>
                Theo dõi và quản lý thông tin các hộ
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant='outline'
              className='cursor-pointer gap-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800'
            >
              <Search className='h-4 w-4' />
              Tìm thành viên
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Table */}
        <HouseholdsTable
          households={householdsWithCount}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          searchText={searchText}
          provinceFilter={provinceFilter}
          wardFilter={wardFilter}
        />
      </div>

      {/* Member Search Modal */}
      <MemberSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMember={(member) => openHousehold(member.household_id)}
      />
    </div>
  );
}
