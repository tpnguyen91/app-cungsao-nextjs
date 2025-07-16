import { createClient } from '@/lib/supabase/server';
import { HouseholdManagementPage } from '@/components/households/household-management-page';

export default async function HouseholdsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Get all households with member count
  // const { data: households } = await supabase
  //   .from('households')
  //   .select(`
  //     *,
  //     head_of_household:family_members!households_head_of_household_id_fkey(
  //       id,
  //       full_name
  //     ),
  //     family_members(count)
  //   `)
  //   .eq('created_by', user?.id)
  //   .order('created_at', { ascending: false })
  const { data: households } = await supabase
    .from('households')
    .select(
      `
      *
    `
    )
    .order('created_at', { ascending: false });

  return <HouseholdManagementPage initialHouseholds={households || []} />;
}
