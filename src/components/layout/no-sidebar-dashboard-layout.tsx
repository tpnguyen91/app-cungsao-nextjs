'use client';

import { useState } from 'react';
import { Navbar, Avatar, Dropdown } from 'flowbite-react';
import { HiLogout, HiUser, HiCog } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface NoSidebarDashboardLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function NoSidebarDashboardLayout({
  children,
  user
}: NoSidebarDashboardLayoutProps) {
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
    <div className='min-h-screen bg-gray-50'>
      {/* Top navbar - Fixed/Overlay */}
      <div className='sticky top-0 z-50 bg-white shadow'>
        <Navbar fluid className='bg-transparent'>
          <Navbar.Brand href='/dashboard'>
            <span className='self-center text-2xl font-semibold whitespace-nowrap text-gray-900'>
              Gia Đình Manager
            </span>
          </Navbar.Brand>

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
      </div>

      <section className='sticky top-16 z-40 border-b bg-white py-3'>
        <div className='container mx-auto px-4'>
          <form className='flex gap-4'>
            <input
              type='text'
              placeholder='Search...'
              className='flex-1 rounded-lg border px-4 py-2'
            />
            <select className='rounded-lg border px-4 py-2'>
              <option>Location</option>
              <option>HCM</option>
              <option>HN</option>
            </select>
          </form>
        </div>
      </section>

      {/* Main content - Full width with top padding for navbar */}
      <main className='h-[calc(100vh-112px)] w-full'>{children}</main>
    </div>
  );
}
