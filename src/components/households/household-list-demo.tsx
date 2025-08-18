'use client';

import { Button } from '@/components/ui/button';
import { useHouseholdNavigation } from '@/hooks/use-household-navigation';
import { Users } from 'lucide-react';

// Mock data for demo
const mockHouseholds = [
  {
    id: 'bd42a226-ba18-4a6c-8c4a-964a16dbb6d0',
    name: 'Gia đình Nguyễn Văn An',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    memberCount: 4
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Gia đình Trần Thị Bình',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    memberCount: 5
  },
  {
    id: '987fcdeb-51a2-4567-890a-bcdef1234567',
    name: 'Gia đình Lê Văn Cường',
    address: '789 Đường DEF, Quận 3, TP.HCM',
    memberCount: 3
  }
];

export function HouseholdListDemo() {
  const { openHouseholdDrawer } = useHouseholdNavigation();

  return (
    <div className='flex flex-wrap gap-2'>
      {mockHouseholds.map((household) => (
        <Button
          key={household.id}
          onClick={() => openHouseholdDrawer(household.id)}
          variant='outline'
          size='sm'
          className='border-blue-300 hover:bg-blue-100'
        >
          <Users className='mr-2 h-4 w-4' />
          {household.name.split(' ').slice(-2).join(' ')}
        </Button>
      ))}
    </div>
  );
}
