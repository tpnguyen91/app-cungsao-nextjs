'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Home,
  Users,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InlineFamilyMembersTable } from '@/components/family-members/inline-family-members-table';
import type { FamilyMember } from '@/types/database';

interface Household {
  id: string;
  household_name: string;
  household_head?: string;
  address?: string;
  province_code?: string;
  ward_code?: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface HouseholdDetailDrawerProps {
  household: Household | null;
  members: FamilyMember[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (household: Household) => void;
}

export function HouseholdDetailDrawer({
  household,
  members,
  isOpen,
  onClose,
  onUpdate
}: HouseholdDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Household>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (household) {
      setEditData(household);
    }
  }, [household]);

  if (!household) return null;

  const handleSave = async () => {
    try {
      // TODO: Implement household update API call
      // await updateHousehold(household.id, editData);

      setIsEditing(false);
      if (onUpdate) {
        onUpdate({ ...household, ...editData } as Household);
      }

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin hộ gia đình'
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
    setEditData(household);
    setIsEditing(false);
  };

  const getHouseholdHead = () => {
    const head = members.find((member) => member.is_head_of_household);
    return head?.full_name || 'Chưa xác định';
  };

  const getMemberCount = () => {
    return members.length;
  };

  const getChildrenCount = () => {
    return members.filter((member) => member.relationship_role === 'CON')
      .length;
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
          <div className='flex items-center justify-between border-b bg-gradient-to-r from-green-50 to-emerald-50 p-6'>
            <div className='flex items-center space-x-4'>
              <Avatar className='h-16 w-16'>
                <AvatarFallback className='bg-green-100 text-xl font-semibold text-green-600'>
                  <Home className='h-8 w-8' />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {household.household_name}
                </h2>
                <div className='mt-1 flex items-center space-x-3'>
                  <Badge className='bg-green-100 text-green-800'>
                    <Users className='mr-1 h-3 w-3' />
                    {getMemberCount()} thành viên
                  </Badge>
                  <Badge className='bg-blue-100 text-blue-800'>
                    Chủ hộ: {getHouseholdHead()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {!isEditing ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditing(true)}
                  className='hover:bg-green-50'
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
            {/* Household Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Home className='h-5 w-5 text-green-500' />
                  <span>Thông tin hộ gia đình</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Basic Info */}
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-600'>
                      Tên hộ gia đình
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.household_name || ''}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            household_name: e.target.value
                          }))
                        }
                        className='font-medium'
                      />
                    ) : (
                      <p className='rounded-lg bg-gray-50 p-3 font-medium text-gray-900'>
                        {household.household_name}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-600'>
                      Chủ hộ
                    </label>
                    <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {getHouseholdHead()}
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className='grid grid-cols-3 gap-4'>
                  <div className='rounded-lg bg-blue-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {getMemberCount()}
                    </div>
                    <div className='text-sm text-blue-600'>Tổng thành viên</div>
                  </div>
                  <div className='rounded-lg bg-green-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {getChildrenCount()}
                    </div>
                    <div className='text-sm text-green-600'>Số con</div>
                  </div>
                  <div className='rounded-lg bg-purple-50 p-4 text-center'>
                    <div className='text-2xl font-bold text-purple-600'>
                      {members.filter((m) => m.gender === 'NAM').length}
                    </div>
                    <div className='text-sm text-purple-600'>Nam</div>
                  </div>
                </div>

                {/* Address Information */}
                <Separator />
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                    <MapPin className='h-5 w-5 text-red-500' />
                    <span>Địa chỉ</span>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-600'>
                      Địa chỉ chi tiết
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.address || ''}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            address: e.target.value
                          }))
                        }
                        placeholder='Nhập địa chỉ'
                      />
                    ) : (
                      <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                        {household.address || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <Separator />
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                    <Phone className='h-5 w-5 text-green-500' />
                    <span>Thông tin liên hệ</span>
                  </div>

                  <div className='grid grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-600'>
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.phone || ''}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              phone: e.target.value
                            }))
                          }
                          placeholder='Nhập số điện thoại'
                        />
                      ) : (
                        <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                          {household.phone || 'Chưa cập nhật'}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium text-gray-600'>
                        Email
                      </label>
                      {isEditing ? (
                        <Input
                          value={editData.email || ''}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              email: e.target.value
                            }))
                          }
                          placeholder='Nhập email'
                          type='email'
                        />
                      ) : (
                        <p className='rounded-lg bg-gray-50 p-3 text-gray-900'>
                          {household.email || 'Chưa cập nhật'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <Separator />
                <div className='space-y-4'>
                  <label className='text-sm font-medium text-gray-600'>
                    Ghi chú
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editData.notes || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          notes: e.target.value
                        }))
                      }
                      placeholder='Nhập ghi chú về hộ gia đình...'
                      rows={3}
                    />
                  ) : (
                    <div className='min-h-[80px] rounded-lg bg-gray-50 p-3 text-gray-900'>
                      {household.notes || 'Chưa có ghi chú'}
                    </div>
                  )}
                </div>

                {/* System Information */}
                <Separator />
                <div className='space-y-4'>
                  <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                    <Calendar className='h-5 w-5 text-gray-500' />
                    <span>Thông tin hệ thống</span>
                  </div>

                  <div className='grid grid-cols-2 gap-6 text-sm text-gray-600'>
                    <div>
                      <span className='font-medium'>Ngày tạo: </span>
                      {new Date(household.created_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </div>
                    <div>
                      <span className='font-medium'>Cập nhật lần cuối: </span>
                      {new Date(household.updated_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Members Section */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Users className='h-5 w-5 text-blue-500' />
                  <span>Danh sách thành viên</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InlineFamilyMembersTable
                  members={members}
                  householdId={household.id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
