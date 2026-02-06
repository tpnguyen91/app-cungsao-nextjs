'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Home,
  Users,
  MapPin,
  Phone,
  Edit2,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  isLoading?: boolean;
  onClose: () => void;
  onUpdate?: (household: Household) => void;
}

export function HouseholdDetailDrawer({
  household,
  members,
  isOpen,
  isLoading = false,
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

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      setIsEditing(false);
      if (onUpdate && household) {
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
    if (household) setEditData(household);
    setIsEditing(false);
  };

  const getMemberCount = () => members.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-2/3 max-w-4xl bg-white shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/80'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
              <span className='text-sm text-slate-500'>Đang tải...</span>
            </div>
          </div>
        )}

        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4'>
            <div className='flex items-center space-x-3'>
              <Avatar className='ring-primary/20 h-11 w-11 ring-2'>
                <AvatarFallback className='bg-primary/10 text-primary'>
                  <Home className='h-5 w-5' />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='text-lg font-semibold text-slate-800'>
                  {household?.household_name || 'Đang tải...'}
                </h2>
                <div className='mt-0.5 flex items-center space-x-2'>
                  <Badge className='bg-primary/10 text-primary'>
                    <Users className='mr-1 h-3 w-3' />
                    {getMemberCount()} thành viên
                  </Badge>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {household && !isEditing ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditing(true)}
                  className='text-primary hover:bg-primary/5 cursor-pointer border-slate-200'
                >
                  <Edit2 className='mr-1.5 h-4 w-4' />
                  Sửa
                </Button>
              ) : household && isEditing ? (
                <div className='flex space-x-2'>
                  <Button
                    size='sm'
                    onClick={handleSave}
                    className='bg-primary hover:bg-primary/90 cursor-pointer'
                  >
                    <Save className='mr-1.5 h-4 w-4' />
                    Lưu
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCancel}
                    className='cursor-pointer border-slate-200'
                  >
                    <X className='mr-1.5 h-4 w-4' />
                    Hủy
                  </Button>
                </div>
              ) : null}

              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                className='cursor-pointer text-slate-500 hover:bg-red-50 hover:text-red-600'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Content */}
          {household && (
            <div className='flex-1 overflow-y-auto'>
              {/* Compact Household Information */}
              <div className='space-y-3 border-b border-slate-100 bg-white p-4'>
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
                        className='h-8 border-slate-200 text-sm'
                      />
                    ) : (
                      <span className='truncate text-slate-700'>
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
                        className='h-8 border-slate-200 text-sm'
                      />
                    ) : (
                      <span className='text-slate-700'>
                        {household.phone || 'Chưa có SĐT'}
                      </span>
                    )}
                  </div>

                  {/* System info */}
                  <div className='col-span-2 flex items-center justify-end gap-4 text-xs text-slate-500'>
                    <span>
                      Tạo:{' '}
                      {new Date(household.created_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                    <span>
                      Cập nhật:{' '}
                      {new Date(household.updated_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {(household.notes || isEditing) && (
                  <div className='space-y-2'>
                    <label className='text-xs font-medium text-slate-600'>
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
                        className='border-slate-200 text-sm'
                      />
                    ) : (
                      <p className='rounded bg-slate-50 px-2 py-1 text-sm text-slate-700'>
                        {household.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Family Members Section */}
              <div className='flex-1 p-4'>
                <InlineFamilyMembersTable
                  members={members}
                  householdId={household.id}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
