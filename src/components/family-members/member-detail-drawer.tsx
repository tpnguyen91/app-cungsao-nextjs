'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { updateFamilyMember } from '@/features/family-members/actions/family-member-actions';
import {
  type FamilyMemberFormData,
  Gender,
  GENDER_LABELS,
  GENDER_OPTIONS,
  getGenderLabel,
  getRelationshipColor,
  getRelationshipLabel,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_OPTIONS,
  RelationshipRole
} from '@/features/family-members/schemas/family-member-schema';
import { useToast } from '@/hooks/use-toast';
import {
  getProvinceByCode,
  getProvinces,
  getWardByCode,
  getWardsByProvince
} from '@/lib/vietnam-data';
import type { FamilyMember } from '@/types/database';
import {
  Calendar,
  Crown,
  Edit2,
  MapPin,
  Save,
  User,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MemberDetailDrawerProps {
  member: FamilyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (member: FamilyMember) => void;
}

export function MemberDetailDrawer({
  member,
  isOpen,
  onClose,
  onUpdate
}: MemberDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<FamilyMember>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setEditData(member);
    }
  }, [member]);

  if (!member) return null;

  const handleSave = async () => {
    try {
      // Convert to proper format for API
      const updateData: FamilyMemberFormData = {
        full_name: editData.full_name!,
        birth_year: editData.birth_year!,
        hometown: editData.hometown || '',
        relationship_role: editData.relationship_role as RelationshipRole,
        gender: editData.gender as Gender,
        is_head_of_household: editData.is_head_of_household!,
        is_alive: editData.is_alive || true,
        notes: editData.notes || '',
        province_id: editData.province_code || '',
        ward_id: editData.ward_code || ''
      };

      const updatedMember = await updateFamilyMember(member.id, updateData);

      setIsEditing(false);
      if (onUpdate) {
        onUpdate({ ...member, ...editData } as FamilyMember);
      }

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin thành viên'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  const handleCancel = () => {
    setEditData(member);
    setIsEditing(false);
  };

  const getAgeFromBirthYear = (birthYear: number) => {
    return new Date().getFullYear() - birthYear;
  };

  const getLocationDisplay = () => {
    const parts = [];

    if (member.province_code) {
      const province = getProvinceByCode(member.province_code);
      if (province) parts.push(province.name);
    }

    return parts.join(', ') || 'Chưa cập nhật';
  };

  const getWardDisplay = () => {
    if (member.ward_code) {
      const ward = getWardByCode(member.ward_code);
      return ward?.name || 'Chưa cập nhật';
    }
    return 'Chưa cập nhật';
  };

  const provinces = getProvinces();
  const wards = editData.province_code
    ? getWardsByProvince(editData.province_code)
    : [];

  const handleProvinceChange = (value: string) => {
    setEditData((prev) => ({ ...prev, province_code: value, ward_code: '' }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-2/3 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-16 w-16'>
                <AvatarFallback className='bg-blue-100 text-xl font-semibold text-blue-600'>
                  {member.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {member.full_name}
                </h2>
                <div className='mt-1 flex items-center space-x-3'>
                  <Badge
                    className={getRelationshipColor(
                      member.relationship_role as RelationshipRole
                    )}
                  >
                    {getRelationshipLabel(
                      member.relationship_role as RelationshipRole
                    )}
                  </Badge>
                  {member.is_head_of_household && (
                    <Badge className='bg-yellow-100 text-yellow-800'>
                      <Crown className='mr-1 h-3 w-3' />
                      Chủ hộ
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {!isEditing ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditing(true)}
                  className='hover:bg-blue-50'
                >
                  <Edit2 className='mr-2 h-4 w-4' />
                  Chỉnh sửa
                </Button>
              ) : (
                <div className='flex space-x-2'>
                  <Button
                    size='sm'
                    onClick={handleSave}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Save className='mr-2 h-4 w-4' />
                    Lưu
                  </Button>
                  <Button variant='outline' size='sm' onClick={handleCancel}>
                    <X className='mr-2 h-4 w-4' />
                    Hủy
                  </Button>
                </div>
              )}

              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='hover:bg-red-50 hover:text-red-600'
              >
                <X className='h-5 w-5' />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 space-y-8 overflow-y-auto p-6'>
            {/* Basic Information */}
            <div className='space-y-6'>
              <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <User className='h-5 w-5 text-blue-500' />
                <span>Thông tin cơ bản</span>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-600'>
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.full_name || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          full_name: e.target.value
                        }))
                      }
                      className='font-medium'
                    />
                  ) : (
                    <p className='rounded-lg bg-gray-50 p-3 font-medium text-gray-900'>
                      {member.full_name}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-600'>
                    Năm sinh
                  </label>
                  {isEditing ? (
                    <Input
                      type='number'
                      value={editData.birth_year || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          birth_year: parseInt(e.target.value)
                        }))
                      }
                    />
                  ) : (
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {member.birth_year} (
                      {getAgeFromBirthYear(member.birth_year)} tuổi)
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-600'>
                    Giới tính
                  </label>
                  {isEditing ? (
                    <Select
                      value={editData.gender || ''}
                      onValueChange={(value) =>
                        setEditData((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn giới tính' />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {GENDER_LABELS[gender]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {getGenderLabel(member.gender as Gender)}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-600'>
                    Quan hệ với chủ hộ
                  </label>
                  {isEditing ? (
                    <Select
                      value={editData.relationship_role || ''}
                      onValueChange={(value) =>
                        setEditData((prev) => ({
                          ...prev,
                          relationship_role: value
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn quan hệ' />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_OPTIONS.map((role) => (
                          <SelectItem key={role} value={role}>
                            {RELATIONSHIP_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {getRelationshipLabel(
                        member.relationship_role as RelationshipRole
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <div className='space-y-6'>
              <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <MapPin className='h-5 w-5 text-red-500' />
                <span>Thông tin địa chỉ</span>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-600'>
                    Tỉnh/Thành phố
                  </label>
                  {isEditing ? (
                    <Select
                      value={editData.province_code || ''}
                      onValueChange={handleProvinceChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn tỉnh/TP' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[200px]'>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name_with_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {getLocationDisplay()}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-600'>
                    Phường/Xã
                  </label>
                  {isEditing ? (
                    <Select
                      value={editData.ward_code || ''}
                      onValueChange={(value) =>
                        setEditData((prev) => ({ ...prev, ward_code: value }))
                      }
                      disabled={!editData.province_code}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn phường/xã' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[200px]'>
                        {wards.map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.name_with_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {getWardDisplay()}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-gray-600'>
                  Quê quán
                </label>
                {isEditing ? (
                  <Input
                    value={editData.hometown || ''}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        hometown: e.target.value
                      }))
                    }
                    placeholder='Nhập quê quán'
                  />
                ) : (
                  <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                    {member.hometown || 'Chưa cập nhật'}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className='space-y-6'>
              <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <Users className='h-5 w-5 text-purple-500' />
                <span>Ghi chú</span>
              </div>

              <div className='space-y-2'>
                {isEditing ? (
                  <Textarea
                    value={editData.notes || ''}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        notes: e.target.value
                      }))
                    }
                    placeholder='Nhập ghi chú về thành viên...'
                    rows={4}
                  />
                ) : (
                  <div className='min-h-[100px] rounded-lg bg-gray-50 p-3 text-gray-900'>
                    {member.notes || 'Chưa có ghi chú'}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* System Information */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <Calendar className='h-5 w-5 text-gray-500' />
                <span>Thông tin hệ thống</span>
              </div>

              <div className='grid grid-cols-2 gap-6 text-sm text-gray-600'>
                <div>
                  <span className='font-medium'>Ngày tạo: </span>
                  {new Date(member.created_at).toLocaleDateString('vi-VN')}
                </div>
                <div>
                  <span className='font-medium'>Cập nhật lần cuối: </span>
                  {new Date(member.updated_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
