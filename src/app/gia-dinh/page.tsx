import { CreateHouseholdDialog } from '@/components/households/create-household-dialog';
import { HouseholdsTable } from '@/components/households/households-table';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { generateDummyHouseholds } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default async function HouseholdsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // 🧪 TESTING MODE: Comment out database queries and use dummy data
  const USE_DUMMY_DATA = true; // Set to false to use real database

  let householdsWithCount = [];

  if (USE_DUMMY_DATA) {
    // Generate dummy data for testing pagination & search
    householdsWithCount = generateDummyHouseholds(100);
    console.log('🧪 Using dummy data - Generated 100 households');
  } else {
    // Real database queries (your original code)
    try {
      // Query households
      const { data: households, error: householdsError } = await supabase
        .from('households')
        .select('*')
        // .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (householdsError) {
        throw householdsError;
      }

      // Query member counts nếu có households
      if (households && households.length > 0) {
        const householdIds = households.map((h) => h.id);

        const { data: memberCounts, error: countError } = await supabase
          .from('family_members')
          .select('household_id')
          .in('household_id', householdIds);

        if (!countError && memberCounts) {
          // Count members by household_id
          const countMap = memberCounts.reduce(
            (acc, member) => {
              acc[member.household_id] = (acc[member.household_id] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          );

          // Add member_count to each household
          householdsWithCount = households.map((household) => ({
            ...household,
            member_count: countMap[household.id] || 0
          }));
        } else {
          // Fallback: set all counts to 0
          householdsWithCount = households.map((household) => ({
            ...household,
            member_count: 0
          }));
        }
      }
    } catch (error) {
      console.error('Error in HouseholdsPage:', error);

      // Fallback to empty array
      householdsWithCount = [];
    }
  }

  console.log({
    mode: USE_DUMMY_DATA ? 'DUMMY' : 'DATABASE',
    totalHouseholds: householdsWithCount.length
  });

  return (
    <div className='h-screen p-6'>
      {/* Page Header - Fixed at top */}
      <div className='mb-6 flex flex-none items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Hộ gia đình</h2>
          <p className='text-muted-foreground'>
            Quản lý thông tin các hộ gia đình
            {USE_DUMMY_DATA && (
              <span className='ml-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800'>
                🧪 TEST MODE: {householdsWithCount.length} dummy records
              </span>
            )}
          </p>
        </div>
        <CreateHouseholdDialog>
          <Button className='bg-pink-600 hover:bg-pink-700'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm hộ gia đình
          </Button>
        </CreateHouseholdDialog>
      </div>

      {/* Table Container - Takes remaining height */}
      <div className='h-[calc(100vh-200px)] overflow-auto'>
        <HouseholdsTable households={householdsWithCount} />
      </div>
    </div>
  );
}
