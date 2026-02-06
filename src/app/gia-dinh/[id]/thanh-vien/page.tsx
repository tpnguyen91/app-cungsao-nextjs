import { InlineFamilyMembersTable } from '@/components/family-members/inline-family-members-table';
import { Button } from '@/components/ui/button';
import { URL_GIA_DINH_DETAIL } from '@/constants/url';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function FamilyMembersPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Check if household exists and belongs to user
  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('*')
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (householdError || !household) {
    console.error('Household not found:', householdError);
    notFound();
  }

  // Get family members for this household
  const { data: members, error: membersError } = await supabase
    .from('family_members')
    .select('*')
    .eq('household_id', id)
    .order('is_head_of_household', { ascending: false })
    .order('created_at', { ascending: true });

  if (membersError) {
    console.error('Error fetching family members:', membersError);
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link href={URL_GIA_DINH_DETAIL(id)}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại
            </Button>
          </Link>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Thành viên - {household.household_name}
            </h2>
            <p className='text-muted-foreground'>
              Quản lý thành viên trong hộ gia đình
            </p>
          </div>
        </div>
      </div>

      <InlineFamilyMembersTable members={members || []} householdId={id} />
    </div>
  );
}
