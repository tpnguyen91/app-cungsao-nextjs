'use client';

import { useToast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/types/database';
import { Loader2, Printer } from 'lucide-react';
import { useState } from 'react';
import { PrintHouseholdMembers } from './print-household-members';
// Sử dụng Server Action có sẵn
import { getFamilyMembers } from '@/features/family-members/actions/family-member-actions';

interface PrintHouseholdWrapperProps {
  householdId: string;
  householdName: string;
  address: string;
  phone?: string;
  headOfHousehold?: {
    id: string;
    full_name: string;
  };
  children?: React.ReactNode;
}

export function PrintHouseholdWrapper({
  householdId,
  householdName,
  address,
  phone,
  headOfHousehold,
  children
}: PrintHouseholdWrapperProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedMembers, setHasLoadedMembers] = useState(false);
  const { toast } = useToast();

  const loadMembers = async () => {
    if (hasLoadedMembers) return; // Đã load rồi thì không load lại

    setIsLoading(true);
    try {
      // Sử dụng Server Action có sẵn thay vì API endpoint
      const data = await getFamilyMembers(householdId);
      setMembers(data || []);
      setHasLoadedMembers(true);
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description:
          error instanceof Error
            ? error.message
            : 'Có lỗi xảy ra khi tải dữ liệu'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const household = {
    id: householdId,
    household_name: householdName,
    address,
    phone,
    head_of_household: headOfHousehold
  };

  return (
    <PrintHouseholdMembers household={household} members={members}>
      <div onClick={loadMembers}>
        {children || (
          <div className='hover:bg-primary/5 hover:text-primary flex w-full cursor-pointer items-center'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <Printer className='mr-2 h-4 w-4' />
                <div>
                  <div className='font-medium'>In danh sách</div>
                  <div className='text-muted-foreground text-xs'>
                    In thông tin thành viên
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PrintHouseholdMembers>
  );
}
