'use client';

import type { User } from '@supabase/supabase-js';

interface FlowbiteDashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function FlowbiteDashboardLayout({
  children
}: FlowbiteDashboardLayoutProps) {
  return (
    <div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Main content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Page content */}
        <main className='flex flex-1 flex-col overflow-hidden'>{children}</main>
      </div>
    </div>
  );
}
