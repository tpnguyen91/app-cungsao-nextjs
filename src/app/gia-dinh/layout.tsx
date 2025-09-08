import { HouseholdDrawerManager } from '@/components/households/household-drawer-manager';
import { FlowbiteDashboardLayout } from '@/components/layout/flowbite-dashboard-layout';
import { URL_AUTH_SIGN_IN } from '@/constants/url';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(URL_AUTH_SIGN_IN);
  }

  return (
    <FlowbiteDashboardLayout user={user}>
      <HouseholdDrawerManager userId={user.id}>
        {children}
      </HouseholdDrawerManager>
    </FlowbiteDashboardLayout>
  );
}
