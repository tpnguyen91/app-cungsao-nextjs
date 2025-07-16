import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { UserNav } from '@/components/layout/user-nav';
import { NoSidebarDashboardLayout } from '@/components/layout/no-sidebar-dashboard-layout';

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
    redirect('/auth/signin');
  }

  return (
    <NoSidebarDashboardLayout user={user}>{children}</NoSidebarDashboardLayout>
  );
}
