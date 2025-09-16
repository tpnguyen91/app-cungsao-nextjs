import { CreateHouseholdDialog } from '@/components/households/create-household-dialog';
import { HouseholdsTable } from '@/components/households/households-table';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { generateDummyHouseholds } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface HouseholdsPageProps {
  searchParams: {
    search?: string;
    province?: string;
    ward?: string;
    page?: string;
    pageSize?: string;
  };
}

export default async function HouseholdsPage({
  searchParams
}: HouseholdsPageProps) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Extract and parse search parameters
  const searchText = searchParams.search || '';
  const provinceFilter = searchParams.province || '';
  const wardFilter = searchParams.ward || '';
  const currentPage = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.pageSize || '10');

  // 🧪 TESTING MODE: Comment out database queries and use dummy data
  const USE_DUMMY_DATA = false; // Set to false to use real database

  let householdsWithCount = [];
  let totalCount = 0;

  if (USE_DUMMY_DATA) {
    // Generate dummy data for testing pagination & search
    const allDummyData = generateDummyHouseholds(100);

    // Apply filters to dummy data (for testing)
    let filteredDummy = allDummyData;
    if (searchText) {
      filteredDummy = filteredDummy.filter(
        (h) =>
          h.household_name.toLowerCase().includes(searchText.toLowerCase()) ||
          h.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
          h.head_of_household?.full_name
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }
    if (provinceFilter) {
      filteredDummy = filteredDummy.filter(
        (h) => h.province_id === provinceFilter
      );
    }
    if (wardFilter) {
      filteredDummy = filteredDummy.filter((h) => h.ward_id === wardFilter);
    }

    // Apply pagination to dummy data
    totalCount = filteredDummy.length;
    const startIndex = (currentPage - 1) * pageSize;
    householdsWithCount = filteredDummy.slice(
      startIndex,
      startIndex + pageSize
    );

    console.log(
      '🧪 Using dummy data - Generated households with filters applied'
    );
  } else {
    // Real database queries with server-side filtering
    try {
      // Build the base query
      let householdsQuery = supabase
        .from('households')
        .select('*', { count: 'exact' }) // Get count for pagination
        .order('created_at', { ascending: false });

      // Apply search filter
      if (searchText) {
        householdsQuery = householdsQuery.or(
          `household_name.ilike.%${searchText}%,phone.ilike.%${searchText}%`
        );
      }

      // Apply province filter
      if (provinceFilter) {
        householdsQuery = householdsQuery.eq('province_id', provinceFilter);
      }

      // Apply ward filter
      if (wardFilter) {
        householdsQuery = householdsQuery.eq('ward_id', wardFilter);
      }

      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      householdsQuery = householdsQuery.range(
        startIndex,
        startIndex + pageSize - 1
      );

      // Execute the query
      const {
        data: households,
        error: householdsError,
        count
      } = await householdsQuery;

      if (householdsError) {
        throw householdsError;
      }

      totalCount = count || 0;

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
      totalCount = 0;
    }
  }

  console.log({
    mode: USE_DUMMY_DATA ? 'DUMMY' : 'DATABASE',
    totalHouseholds: householdsWithCount.length,
    totalCount,
    currentPage,
    filters: { searchText, provinceFilter, wardFilter }
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
                🧪 TEST MODE: {totalCount} filtered records
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
    </div>
  );
}
