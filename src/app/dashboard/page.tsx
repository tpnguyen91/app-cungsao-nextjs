import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Home, Calendar, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Fetch statistics
  const { data: households } = await supabase
    .from('households')
    .select('id')
    .eq('created_by', user?.id);

  const { data: familyMembers } = await supabase
    .from('family_members')
    .select('id')
    .in('household_id', households?.map((h) => h.id) || []);

  const { data: upcomingWorship } = await supabase
    .from('worship_history')
    .select('id')
    .in('household_id', households?.map((h) => h.id) || [])
    .gte('worship_date', new Date().toISOString().split('T')[0]);

  const stats = [
    {
      title: 'Tổng hộ gia đình',
      value: households?.length || 0,
      icon: Home,
      description: 'Số hộ gia đình đang quản lý',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Thành viên',
      value: familyMembers?.length || 0,
      icon: Users,
      description: 'Tổng số thành viên trong các hộ',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Lịch cúng sắp tới',
      value: upcomingWorship?.length || 0,
      icon: Calendar,
      description: 'Số ngày cúng trong tháng này',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Hoạt động gần đây',
      value: '0',
      icon: Clock,
      description: 'Cập nhật trong tuần qua',
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-gray-900'>
            Trang chủ
          </h2>
          <p className='text-muted-foreground'>
            Xin chào, {user?.user_metadata?.full_name || user?.email}! 👋
          </p>
        </div>
        <Link href='/dashboard/households'>
          <Button className='bg-pink-600 hover:bg-pink-700'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm hộ gia đình
          </Button>
        </Link>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className='border-0 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-gray-700'>
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className='h-4 w-4' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-gray-900'>
                  {stat.value}
                </div>
                <p className='text-muted-foreground text-xs'>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='border-0 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-gray-900'>Bắt đầu nhanh</CardTitle>
            <CardDescription>
              Các bước để thiết lập hệ thống quản lý gia đình
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-600'>
                  1
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    Tạo hộ gia đình
                  </p>
                  <p className='text-xs text-gray-500'>
                    Thêm thông tin cơ bản về hộ gia đình của bạn
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-600'>
                  2
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    Thêm thành viên
                  </p>
                  <p className='text-xs text-gray-500'>
                    Nhập thông tin các thành viên trong gia đình
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-600'>
                  3
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    Lập lịch cúng
                  </p>
                  <p className='text-xs text-gray-500'>
                    Tạo lịch cúng cho các thành viên đã mất
                  </p>
                </div>
              </div>
            </div>
            <Link href='/dashboard/households'>
              <Button className='mt-4 w-full bg-pink-600 hover:bg-pink-700'>
                Bắt đầu ngay
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-gray-900'>Hoạt động gần đây</CardTitle>
            <CardDescription>Các thay đổi và cập nhật mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <div className='h-2 w-2 rounded-full bg-pink-500'></div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-900'>
                    Chào mừng đến với hệ thống!
                  </p>
                  <p className='text-xs text-gray-500'>
                    Bắt đầu bằng cách tạo hộ gia đình đầu tiên
                  </p>
                </div>
              </div>
              {households && households.length > 0 && (
                <div className='flex items-center space-x-4'>
                  <div className='h-2 w-2 rounded-full bg-green-500'></div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      Đã tạo {households.length} hộ gia đình
                    </p>
                    <p className='text-xs text-gray-500'>
                      Sẵn sàng thêm thành viên và lịch cúng
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
