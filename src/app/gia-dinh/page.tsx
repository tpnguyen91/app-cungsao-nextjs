import { CreateHouseholdDialog } from '@/components/households/create-household-dialog';
import { HouseholdsTable } from '@/components/households/households-table';
import { LogoutButton } from '@/components/layout/logout-button';
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
  const supabase = await createClient();

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
            <LogoutButton />
            <CreateHouseholdDialog>
              <Button className='bg-primary hover:bg-primary/90 cursor-pointer gap-2 px-4 shadow-sm'>
                <Plus className='h-4 w-4' />
                Thêm hộ gia đình
              </Button>
            </CreateHouseholdDialog>
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
    </div>
  );
}
