'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, Navbar, Avatar, Dropdown } from 'flowbite-react';
import {
  HiHome,
  HiUsers,
  HiCalendar,
  HiCog,
  HiMenuAlt3,
  HiLogout,
  HiUser
} from 'react-icons/hi';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface FlowbiteDashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

const sidebarItems = [
  {
    href: '/dashboard',
    label: 'Trang chủ',
    icon: HiHome
  },
  {
    href: '/dashboard/households',
    label: 'Hộ gia đình',
    icon: HiUsers
  },
  {
    href: '/dashboard/worship',
    label: 'Lịch cúng',
    icon: HiCalendar
  },
  {
    href: '/dashboard/settings',
    label: 'Cài đặt',
    icon: HiCog
  }
];

export function FlowbiteDashboardLayout({
  children,
  user
}: FlowbiteDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-50 md:relative md:inset-auto md:block`}
      >
        <div className='flex h-full'>
          <Sidebar aria-label='Dashboard sidebar' className='w-64'>
            <div className='flex h-full flex-col justify-between py-2'>
              <div>
                <div className='mb-5 flex items-center pl-2.5'>
                  <span className='self-center text-xl font-semibold whitespace-nowrap dark:text-white'>
                    Gia Đình Manager
                  </span>
                </div>
                <Sidebar.Items>
                  <Sidebar.ItemGroup>
                    {sidebarItems.map((item) => (
                      <Sidebar.Item
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        active={pathname === item.href}
                        as={Link}
                      >
                        {item.label}
                      </Sidebar.Item>
                    ))}
                  </Sidebar.ItemGroup>
                </Sidebar.Items>
              </div>
            </div>
          </Sidebar>
          {sidebarOpen && (
            <div
              className='flex-1 md:hidden'
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Top navbar */}
        <Navbar className='border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center'>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='mr-3 cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
            >
              <HiMenuAlt3 className='h-6 w-6' />
            </button>
            <Navbar.Brand>
              <span className='self-center text-xl font-semibold whitespace-nowrap dark:text-white'>
                Quản lý Hộ Gia Đình
              </span>
            </Navbar.Brand>
          </div>

          <div className='flex items-center'>
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt='User settings'
                  img={undefined}
                  rounded
                  placeholderInitials={initials}
                />
              }
            >
              <Dropdown.Header>
                <span className='block text-sm font-medium'>{displayName}</span>
                <span className='block truncate text-sm text-gray-500'>
                  {user.email}
                </span>
              </Dropdown.Header>
              <Dropdown.Item icon={HiUser}>Hồ sơ</Dropdown.Item>
              <Dropdown.Item icon={HiCog}>Cài đặt</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item icon={HiLogout} onClick={handleSignOut}>
                Đăng xuất
              </Dropdown.Item>
            </Dropdown>
          </div>
        </Navbar>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
