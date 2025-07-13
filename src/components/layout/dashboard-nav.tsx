'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Settings, Flower2 } from 'lucide-react';

const navItems = [
  {
    title: 'Trang chủ',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Hộ gia đình',
    href: '/dashboard/households',
    icon: Users
  },
  {
    title: 'Lịch cúng',
    href: '/dashboard/worship',
    icon: Calendar
  },
  {
    title: 'Cài đặt',
    href: '/dashboard/settings',
    icon: Settings
  }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className='w-64 border-r border-gray-200 bg-white shadow-sm'>
      <div className='p-6'>
        <div className='flex items-center space-x-2'>
          <div className='rounded-lg bg-pink-100 p-2'>
            <Flower2 className='h-6 w-6 text-pink-600' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>Gia Đình</h2>
            <p className='text-xs text-gray-500'>Manager</p>
          </div>
        </div>
      </div>
      <ul className='space-y-2 px-4'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border border-pink-200 bg-pink-50 text-pink-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className='h-5 w-5' />
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className='absolute right-4 bottom-4 left-4'>
        <div className='rounded-lg border border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 p-4'>
          <div className='mb-2 flex items-center space-x-2'>
            <Flower2 className='h-4 w-4 text-pink-600' />
            <span className='text-sm font-medium text-gray-900'>Tip</span>
          </div>
          <p className='text-xs text-gray-600'>
            Bắt đầu bằng cách thêm hộ gia đình đầu tiên của bạn
          </p>
        </div>
      </div>
    </nav>
  );
}
