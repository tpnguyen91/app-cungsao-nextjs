import { CreateHouseholdDialog } from '@/components/households/create-household-dialog';
import { HouseholdsTable } from '@/components/households/households-table';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Home, Plus } from 'lucide-react';

interface HouseholdsPageProps {
  searchParams: Promise<{
    search?: string;
    province?: string;
    ward?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function HouseholdsPage({
  searchParams
}: HouseholdsPageProps) {
  const params = await searchParams;
  const supabase = createClient();

  // Extract and parse search parameters
  const searchText = params.search || '';
  const provinceFilter = params.province || '';
  const wardFilter = params.ward || '';
  const currentPage = parseInt(params.page || '1');
  const pageSize = parseInt(params.pageSize || '10');

  let householdsWithCount: any[] = [];
  let totalCount = 0;

  try {
    // Build the base query
    let householdsQuery = supabase
      .from('households')
      .select('*', { count: 'exact' })
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

    const {
      data: households,
      error: householdsError,
      count
    } = await householdsQuery;

    if (householdsError) throw householdsError;

    totalCount = count || 0;

    // Query member counts
    if (households && households.length > 0) {
      const householdIds = households.map((h) => h.id);

      const { data: memberCounts, error: countError } = await supabase
        .from('family_members')
        .select('household_id')
        .in('household_id', householdIds);

      if (!countError && memberCounts) {
        const countMap = memberCounts.reduce(
          (acc, member) => {
            acc[member.household_id] = (acc[member.household_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        householdsWithCount = households.map((household) => ({
          ...household,
          member_count: countMap[household.id] || 0
        }));
      } else {
        householdsWithCount = households.map((household) => ({
          ...household,
          member_count: 0
        }));
      }
    }
  } catch (error) {
    console.error('Error in HouseholdsPage:', error);
    householdsWithCount = [];
    totalCount = 0;
  }

  return (
    <div className='min-h-screen bg-amber-50/30 p-6'>
      <div className='mx-auto max-w-7xl space-y-5'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100'>
              <Home className='h-5 w-5 text-green-700' />
            </div>
            <div>
              <h1 className='text-lg font-semibold text-green-900'>
                Quản lý hộ gia đình
              </h1>
              <p className='text-sm text-green-700/70'>
                Theo dõi và quản lý thông tin các hộ
              </p>
            </div>
          </div>

          <CreateHouseholdDialog>
            <Button className='cursor-pointer gap-2 bg-green-700 px-4 shadow-sm hover:bg-green-800'>
              <Plus className='h-4 w-4' />
              Thêm hộ gia đình
            </Button>
          </CreateHouseholdDialog>
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
    </div>
  );
}
