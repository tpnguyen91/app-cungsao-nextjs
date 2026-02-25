import { createClient } from '@/lib/supabase/server';
import { HouseholdsPageContent } from './households-page-content';

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

  // Get user data
  const {
    data: { user }
  } = await supabase.auth.getUser();

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
      householdsQuery = householdsQuery.eq('province_code', provinceFilter);
    }

    // Apply ward filter
    if (wardFilter) {
      householdsQuery = householdsQuery.eq('ward_code', wardFilter);
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

    console.log('Households query result:', {
      households,
      count,
      householdsError
    });

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
    <HouseholdsPageContent
      householdsWithCount={householdsWithCount}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={pageSize}
      searchText={searchText}
      provinceFilter={provinceFilter}
      wardFilter={wardFilter}
      userEmail={user?.email || ''}
    />
  );
}
