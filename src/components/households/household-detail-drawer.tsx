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
          {/* Header - Compact version */}
          <div className='flex items-center justify-between border-b bg-gradient-to-r from-green-50 to-emerald-50 p-4'>
            <div className='flex items-center space-x-3'>
              <Avatar className='h-12 w-12'>
                <AvatarFallback className='bg-green-100 text-green-600'>
                  <Home className='h-6 w-6' />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>
                  {household.household_name}
                </h2>
                <div className='mt-1 flex items-center space-x-2'>
                  <Badge className='bg-green-100 text-green-800' size='sm'>
                    <Users className='mr-1 h-3 w-3' />
                    {getMemberCount()} TV
                  </Badge>
                  {/* <Badge className='bg-blue-100 text-blue-800' size="sm">
                    {getHouseholdHead()}
                  </Badge> */}
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
                  <Edit2 className='mr-1 h-4 w-4' />
                  Sửa
                </Button>
              ) : (
                <div className='flex space-x-2'>
                  <Button
                    size='sm'
                    onClick={handleSave}
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Save className='mr-1 h-4 w-4' />
                    Lưu
                  </Button>
                  <Button variant='outline' size='sm' onClick={handleCancel}>
                    <X className='mr-1 h-4 w-4' />
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
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {/* Compact Household Information */}
            <div className='space-y-3 border-b bg-gray-50/50 p-4'>
              {/* Compact Info Grid */}
              <div className='grid grid-cols-4 gap-3 text-sm'>
                {/* Address */}
                <div className='flex items-center space-x-2'>
                  <MapPin className='h-4 w-4 flex-shrink-0 text-red-500' />
                  {isEditing ? (
                    <Input
                      value={editData.address || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: e.target.value
                        }))
                      }
                      placeholder='Địa chỉ'
                      className='h-8 text-sm'
                    />
                  ) : (
                    <span className='truncate text-gray-700'>
                      {household.address || 'Chưa có địa chỉ'}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className='flex items-center space-x-2'>
                  <Phone className='h-4 w-4 flex-shrink-0 text-green-500' />
                  {isEditing ? (
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          phone: e.target.value
                        }))
                      }
                      placeholder='Số điện thoại'
                      className='h-8 text-sm'
                    />
                  ) : (
                    <span className='text-gray-700'>
                      {household.phone || 'Chưa có SĐT'}
                    </span>
                  )}
                </div>
                {/* System info - Minimal */}
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>
                    Tạo:{' '}
                    {new Date(household.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  <span>
                    Cập nhật:{' '}
                    {new Date(household.updated_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Notes - Only show if exists or editing */}
              {(household.notes || isEditing) && (
                <div className='space-y-2'>
                  <label className='text-xs font-medium text-gray-600'>
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
                      placeholder='Ghi chú về hộ gia đình...'
                      rows={2}
                      className='text-sm'
                    />
                  ) : (
                    <p className='rounded bg-white px-2 py-1 text-sm text-gray-700'>
                      {household.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Family Members Section - Takes up most of the space */}
            <div className='flex-1 p-4'>
              <InlineFamilyMembersTable
                members={members}
                householdId={household.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
