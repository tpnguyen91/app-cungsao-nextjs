import { EditHouseholdDialog } from '@/components/households/edit-household-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { URL_GIA_DINH, URL_GIA_DINH_THANH_VIEN } from '@/constants/url';
import { createClient } from '@/lib/supabase/server';
import { getProvinceByCode, getWardByCode } from '@/lib/vietnam-data';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Calendar, Crown, Edit, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function HouseholdDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Layout already handles auth redirect, but double check
  if (!user) {
    console.error('No user found in household detail page');
    notFound();
  }

  // Get household with family members
  const { data: household, error } = await supabase
    .from('households')
    .select(
      `
      *,
      head_of_household:family_members!households_head_of_household_id_fkey(
        id,
        full_name
      ),
      family_members(*)
    `
    )
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (error) {
    console.error(
      'Error fetching household:',
      error.message,
      'ID:',
      id,
      'User:',
      user.id
    );
    notFound();
  }

  if (!household) {
    console.error('Household not found for ID:', id);
    notFound();
  }

  // Get recent and upcoming worship events
  const { data: recentWorship } = await supabase
    .from('worship_history')
    .select(
      `
      *,
      family_member:family_members(full_name)
    `
    )
    .eq('household_id', params.id)
    .order('worship_date', { ascending: false })
    .limit(5);

  const { data: upcomingWorship } = await supabase
    .from('worship_history')
    .select(
      `
      *,
      family_member:family_members(full_name)
    `
    )
    .eq('household_id', params.id)
    .gte('worship_date', new Date().toISOString().split('T')[0])
    .order('worship_date', { ascending: true })
    .limit(5);

  const livingMembers =
    household.family_members?.filter((m: any) => m.is_alive) || [];
  const deceasedMembers =
    household.family_members?.filter((m: any) => !m.is_alive) || [];

  // Get full address
  const getFullAddress = () => {
    const parts = [household.address];

    if (household.ward_code) {
      const ward = getWardByCode(household.ward_code);
      if (ward) parts.push(ward.name_with_type);
    }

    if (household.province_code) {
      const province = getProvinceByCode(household.province_code);
      if (province) parts.push(province.name_with_type);
    }

    return parts.filter(Boolean).join(', ');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link href={URL_GIA_DINH}>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại danh sách
            </Button>
          </Link>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {household.household_name}
            </h2>
            <p className='text-muted-foreground flex items-center'>
              <MapPin className='mr-1 h-4 w-4' />
              {getFullAddress()}
            </p>
          </div>
        </div>
        <div className='flex space-x-2'>
          <EditHouseholdDialog household={household}>
            <Button variant='outline'>
              <Edit className='mr-2 h-4 w-4' />
              Chỉnh sửa
            </Button>
          </EditHouseholdDialog>
          <Link href={URL_GIA_DINH_THANH_VIEN(id)}>
            <Button>
              <Users className='mr-2 h-4 w-4' />
              Quản lý thành viên
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tổng thành viên
            </CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {household.family_members?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Còn sống</CardTitle>
            <Users className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {livingMembers.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Đã mất</CardTitle>
            <Users className='h-4 w-4 text-gray-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>
              {deceasedMembers.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Lịch cúng sắp tới
            </CardTitle>
            <Calendar className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {upcomingWorship?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members Overview */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Thành viên gia đình</CardTitle>
            <CardDescription>
              Danh sách thành viên trong hộ gia đình
            </CardDescription>
          </CardHeader>
          <CardContent>
            {household.family_members && household.family_members.length > 0 ? (
              <div className='space-y-3'>
                {household.family_members.slice(0, 5).map((member: any) => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <div>
                        <p className='flex items-center text-sm font-medium'>
                          {member.full_name}
                          {member.is_head_of_household && (
                            <Crown className='ml-2 h-4 w-4 text-yellow-500' />
                          )}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {member.relationship_role} • {member.birth_year}
                        </p>
                      </div>
                    </div>
                    <div>
                      {member.is_alive ? (
                        <Badge
                          variant='secondary'
                          className='bg-green-100 text-green-800'
                        >
                          Còn sống
                        </Badge>
                      ) : (
                        <Badge
                          variant='secondary'
                          className='bg-gray-100 text-gray-800'
                        >
                          Đã mất
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {household.family_members.length > 5 && (
                  <p className='text-muted-foreground text-sm'>
                    và {household.family_members.length - 5} thành viên khác...
                  </p>
                )}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Chưa có thành viên nào. Thêm thành viên đầu tiên.
              </p>
            )}
            <div className='mt-4'>
              <Link href={URL_GIA_DINH_THANH_VIEN(id)}>
                <Button variant='outline' className='w-full'>
                  <Users className='mr-2 h-4 w-4' />
                  Quản lý thành viên
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lịch cúng gần đây</CardTitle>
            <CardDescription>Các ngày cúng đã thực hiện</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWorship && recentWorship.length > 0 ? (
              <div className='space-y-3'>
                {recentWorship.map((worship) => (
                  <div
                    key={worship.id}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='text-sm font-medium'>
                        {worship.worship_type}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {worship.family_member?.full_name || 'Cúng chung'} •
                        {format(new Date(worship.worship_date), 'dd/MM/yyyy', {
                          locale: vi
                        })}
                      </p>
                    </div>
                    <Badge variant='outline'>
                      {format(new Date(worship.worship_date), 'dd/MM', {
                        locale: vi
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Chưa có lịch cúng nào được ghi nhận.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
