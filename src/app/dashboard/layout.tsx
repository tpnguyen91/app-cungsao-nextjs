import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/layout/dashboard-nav';
import { UserNav } from '@/components/layout/user-nav';
import { FlowbiteDashboardLayout } from '@/components/layout/flowbite-dashboard-layout';

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
    <FlowbiteDashboardLayout user={user}>{children}</FlowbiteDashboardLayout>
  );

  // return (
  //   <div className='flex min-h-screen bg-gray-50'>
  //     <DashboardNav />
  //     <div className='flex flex-1 flex-col'>
  //       <header className='border-b border-gray-200 bg-white shadow-sm'>
  //         <div className='flex h-16 items-center justify-between px-6'>
  //           <div>
  //             <h1 className='text-xl font-semibold text-gray-900'>
  //               Quản lý Hộ Gia Đình
  //             </h1>
  //             <p className='text-sm text-gray-500'>
  //               Hệ thống quản lý thông tin gia đình và lịch cúng
  //             </p>
  //           </div>
  //           <UserNav user={user} />
  //         </div>
  //       </header>
  //       <main className='flex-1 p-6'>{children}</main>
  //     </div>
  //   </div>
  // );
}
