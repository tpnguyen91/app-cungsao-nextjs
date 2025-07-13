import { createClient } from '@/lib/supabase/server';
import { HouseholdsTable } from '@/components/households/households-table';
import { CreateHouseholdDialog } from '@/components/households/create-household-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function HouseholdsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: households } = await supabase
    .from('households')
    .select(
      `
      *,
      head_of_household:family_members!households_head_of_household_id_fkey(
        id,
        full_name
      ),
      _count:family_members(count)
    `
    )
    .eq('created_by', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Hộ gia đình</h2>
          <p className='text-muted-foreground'>
            Quản lý thông tin các hộ gia đình
          </p>
        </div>
        <CreateHouseholdDialog>
          <Button className='bg-pink-600 hover:bg-pink-700'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm hộ gia đình
          </Button>
        </CreateHouseholdDialog>
      </div>

      <HouseholdsTable households={households || []} />
    </div>
  );
}
