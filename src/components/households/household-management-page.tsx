'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Users,
  Crown,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateHouseholdDialog } from './create-household-dialog';
import { EditHouseholdDialog } from './edit-household-dialog';
import { DeleteHouseholdDialog } from './delete-household-dialog';
import { InlineFamilyMembersTable } from '@/components/family-members/inline-family-members-table';
import {
  getProvinces,
  getWardsByProvince,
  getProvinceByCode,
  getWardByCode
} from '@/lib/vietnam-data';
import { getHousehold } from '@/features/households/actions/household-actions';
import { useToast } from '@/hooks/use-toast';
import type { FamilyMember, Household } from '@/types/database';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface IHouseHoldDetail {
  familyMembers: Array<FamilyMember>;
  id: string;
  household_name: string;
  address: string;
  ward_id: number;
  province: number;
}

interface HouseholdWithMembers extends Household {
  head_of_household?: {
    id: string;
    full_name: string;
  };
  family_members?: { count: number }[] | any[];
}

interface HouseholdManagementPageProps {
  initialHouseholds: HouseholdWithMembers[];
}

export function HouseholdManagementPage({
  initialHouseholds
}: HouseholdManagementPageProps) {
  const [households, setHouseholds] =
    useState<HouseholdWithMembers[]>(initialHouseholds);
  const [selectedHousehold, setSelectedHousehold] =
    useState<HouseholdWithMembers | null>(null);
  const [selectedHouseholdDetail, setSelectedHouseholdDetail] =
    useState<IHouseHoldDetail>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  console.log({ selectedHouseholdDetail });

  const provinces = getProvinces();
  const wards = selectedProvince ? getWardsByProvince(selectedProvince) : [];

  // Filter households based on search and filters
  const filteredHouseholds = households.filter((household) => {
    const matchesSearch =
      household.household_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      household.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince =
      !selectedProvince || household.province_id === selectedProvince;
    const matchesWard = !selectedWard || household.ward_id === selectedWard;

    return matchesSearch && matchesProvince && matchesWard;
  });

  // Load household detail when selected
  const handleHouseholdSelect = async (household: HouseholdWithMembers) => {
    setSelectedHousehold(household);
    setLoading(true);

    try {
      const detail = await getHousehold(household.id);
      setSelectedHouseholdDetail({
        ...selectedHouseholdDetail,
        familyMembers: detail
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải chi tiết hộ gia đình'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get member count for display
  const getMemberCount = (household: HouseholdWithMembers) => {
    if (Array.isArray(household.family_members)) {
      return household.family_members.length;
    }
    return household.family_members?.[0]?.count || 0;
  };

  // Get full address for display
  const getFullAddress = (household: HouseholdWithMembers) => {
    const parts = [household.address];

    if (household.ward_id) {
      const ward = getWardByCode(household.ward_id);
      if (ward) parts.push(ward.name_with_type);
    }

    if (household.province_id) {
      const province = getProvinceByCode(household.province_id);
      if (province) parts.push(province.name_with_type);
    }

    return parts.filter(Boolean).join(', ');
  };

  // Reset ward when province changes
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedWard('');
  };

  return (
    <div className='flex h-screen flex-col bg-gray-50'>
      {/* Header with search and filters - Fixed/Overlay */}
      {/* <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 p-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hộ gia đình, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-base"
            />
          </div>
          
          <CreateHouseholdDialog>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Thêm hộ gia đình
            </Button>
          </CreateHouseholdDialog>
        </div>
      </div> */}

      {/* Main content area - Flex remainder space */}
      <div className='container mx-auto grid h-full grid-cols-1 gap-6 px-4 pt-4 lg:grid-cols-3'>
        {/* Left sidebar - Household list */}
        <div className='h-full overflow-y-auto rounded-lg bg-white p-6 shadow lg:col-span-1'>
          <div className='flex-shrink-0 border-b border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <h2 className='font-semibold text-gray-900'>
                {filteredHouseholds.length} hộ gia đình
              </h2>
              <Badge variant='secondary'>{households.length} tổng cộng</Badge>
            </div>
          </div>

          <ScrollArea className='flex-1 overflow-y-auto'>
            <div className='space-y-2 p-2'>
              {filteredHouseholds.length === 0 ? (
                <div className='py-8 text-center text-gray-500'>
                  <Users className='mx-auto mb-4 h-12 w-12 text-gray-300' />
                  <p>Không tìm thấy hộ gia đình nào</p>
                </div>
              ) : (
                filteredHouseholds.map((household) => (
                  <HouseholdCard
                    key={household.id}
                    household={household}
                    isSelected={selectedHousehold?.id === household.id}
                    onClick={() => handleHouseholdSelect(household)}
                    memberCount={getMemberCount(household)}
                    fullAddress={getFullAddress(household)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right content - Household detail */}
        <section className='h-full space-y-4 overflow-y-auto rounded-lg bg-white p-6 shadow lg:col-span-2'>
          {selectedHousehold ? (
            <HouseholdDetailView
              household={selectedHousehold}
              householdDetail={selectedHouseholdDetail}
              loading={loading}
              onUpdate={(updatedHousehold) => {
                setHouseholds((prev) =>
                  prev.map((h) =>
                    h.id === updatedHousehold.id
                      ? { ...h, ...updatedHousehold }
                      : h
                  )
                );
                setSelectedHousehold((prev) =>
                  prev ? { ...prev, ...updatedHousehold } : null
                );
              }}
              onDelete={(deletedId) => {
                setHouseholds((prev) => prev.filter((h) => h.id !== deletedId));
                setSelectedHousehold(null);
                setSelectedHouseholdDetail(null);
              }}
            />
          ) : (
            <div className='flex flex-1 items-center justify-center bg-gray-50'>
              <div className='text-center'>
                <Users className='mx-auto mb-6 h-20 w-20 text-gray-300' />
                <h3 className='mb-2 text-xl font-medium text-gray-900'>
                  Chọn hộ gia đình để xem chi tiết
                </h3>
                <p className='text-lg text-gray-500'>
                  Chọn một hộ gia đình từ danh sách bên trái để xem thông tin
                  chi tiết
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Household card component for the left sidebar
function HouseholdCard({
  household,
  isSelected,
  onClick,
  memberCount,
  fullAddress
}: {
  household: HouseholdWithMembers;
  isSelected: boolean;
  onClick: () => void;
  memberCount: number;
  fullAddress: string;
}) {
  return (
    <div
      className={`cursor-pointer border-b-1 border-b-gray-200 p-0 transition-all hover:shadow-md ${
        isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className='p-2'>
        <div className='mb-2 flex items-start justify-between'>
          <h3 className='truncate font-medium text-gray-900'>
            {household.household_name}
          </h3>
          {household.head_of_household && (
            <Crown className='ml-2 h-4 w-4 flex-shrink-0 text-yellow-500' />
          )}
        </div>

        <div className='space-y-1 text-sm text-gray-600'>
          <div className='flex items-center'>
            <MapPin className='mr-1 h-3 w-3 flex-shrink-0' />
            <span className='truncate'>{fullAddress}</span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <Users className='mr-1 h-3 w-3' />
              <span>{memberCount} thành viên</span>
            </div>
            <div className='flex items-center'>
              <Calendar className='mr-1 h-3 w-3' />
              <span>
                {format(new Date(household.created_at), 'dd/MM/yyyy', {
                  locale: vi
                })}
              </span>
            </div>
          </div>
        </div>

        {household.head_of_household && (
          <div className='mt-2 border-t border-gray-100 pt-2'>
            <div className='flex items-center text-xs text-gray-500'>
              <Crown className='mr-1 h-3 w-3 text-yellow-500' />
              <span>Chủ hộ: {household.head_of_household.full_name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Household detail view component
function HouseholdDetailView({
  household,
  householdDetail,
  loading,
  onUpdate,
  onDelete
}: {
  household: HouseholdWithMembers;
  householdDetail: IHouseHoldDetail;
  loading: boolean;
  onUpdate: (household: HouseholdWithMembers) => void;
  onDelete: (id: string) => void;
}) {
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

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {household.household_name}
            </h1>
            <p className='mt-1 flex items-center text-gray-600'>
              <MapPin className='mr-1 h-4 w-4' />
              {getFullAddress()}
            </p>
          </div>
          <div className='flex space-x-2'>
            <EditHouseholdDialog household={household} onUpdate={onUpdate}>
              <Button variant='outline'>Chỉnh sửa</Button>
            </EditHouseholdDialog>
            <DeleteHouseholdDialog
              householdId={household.id}
              householdName={household.household_name}
              onDelete={() => onDelete(household.id)}
            >
              <Button
                variant='outline'
                className='text-red-600 hover:text-red-700'
              >
                Xóa
              </Button>
            </DeleteHouseholdDialog>
          </div>
        </div>
      </div>
      {/* Members table */}
      <div className='flex-1 overflow-auto bg-gray-50'>
        <div className='p-6'>
          {householdDetail && (
            <InlineFamilyMembersTable
              members={householdDetail.familyMembers || []}
              householdId={household.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
