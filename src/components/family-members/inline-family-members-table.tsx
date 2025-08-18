// File: components/family-members/inline-family-members-table.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X, Trash2, Crown, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  updateFamilyMember,
  deleteFamilyMember,
  createFamilyMember
} from '@/features/family-members/actions/family-member-actions';
import {
  familyMemberSchema,
  type FamilyMemberFormData,
  RelationshipRole,
  Gender,
  RELATIONSHIP_OPTIONS,
  GENDER_OPTIONS,
  RELATIONSHIP_LABELS,
  GENDER_LABELS,
  getRelationshipLabel,
  getGenderLabel,
  getRelationshipColor
} from '@/features/family-members/schemas/family-member-schema';
import {
  getProvinces,
  getWardsByProvince,
  getProvinceByCode,
  getWardByCode
} from '@/lib/vietnam-data';
import type { FamilyMember } from '@/types/database';
import { z } from 'zod';
import { MemberDetailDrawer } from './member-detail-drawer';

// Extended schema for inline editing with all required fields
const inlineEditSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  birth_year: z.number().min(1900).max(new Date().getFullYear()),
  province_code: z.string().min(1, 'Chọn tỉnh/thành phố'),
  ward_code: z.string().min(1, 'Chọn phường/xã'),
  relationship_role: z.nativeEnum(RelationshipRole, {
    required_error: 'Vui lòng chọn quan hệ'
  }),
  gender: z.nativeEnum(Gender, {
    required_error: 'Vui lòng chọn giới tính'
  }),
  is_head_of_household: z.boolean()
});

type InlineEditFormData = z.infer<typeof inlineEditSchema>;

interface InlineFamilyMembersTableProps {
  members: FamilyMember[];
  householdId: string;
}

interface EditingMember extends FamilyMember {
  isEditing?: boolean;
}

export function InlineFamilyMembersTable({
  members,
  householdId
}: InlineFamilyMembersTableProps) {
  const [editingMembers, setEditingMembers] =
    useState<EditingMember[]>(members);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  // Start editing a member
  const startEdit = (memberId: string) => {
    setEditingMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, isEditing: true } : member
      )
    );
  };

  // Cancel editing
  const cancelEdit = (memberId: string) => {
    setEditingMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...members.find((m) => m.id === memberId)!, isEditing: false }
          : member
      )
    );
  };

  // Save member changes
  const saveMember = async (memberId: string, data: Partial<FamilyMember>) => {
    try {
      // Convert to proper format for API
      const updateData: FamilyMemberFormData = {
        full_name: data.full_name!,
        birth_year: data.birth_year!,
        hometown: data.hometown || '',
        relationship_role: data.relationship_role as RelationshipRole,
        gender: data.gender as Gender,
        is_head_of_household: data.is_head_of_household!,
        is_alive: data.is_alive || true,
        notes: data.notes || '',
        province_id: data.province_code || '',
        ward_id: data.ward_code || ''
      };

      await updateFamilyMember(memberId, updateData);

      // Update local state
      setEditingMembers((prev) =>
        prev.map((member) =>
          member.id === memberId
            ? { ...member, ...data, isEditing: false }
            : member.is_head_of_household && data.is_head_of_household
              ? { ...member, is_head_of_household: false } // Remove head status from others
              : member
        )
      );

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

  // Delete member
  const deleteMember = async (memberId: string, memberName: string) => {
    try {
      await deleteFamilyMember(memberId);
      setEditingMembers((prev) =>
        prev.filter((member) => member.id !== memberId)
      );

      toast({
        title: 'Thành công',
        description: `Đã xóa thành viên ${memberName}`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  // Open member detail drawer
  const openMemberDetail = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsDrawerOpen(true);
  };

  // Update member from drawer
  const updateMemberFromDrawer = (updatedMember: FamilyMember) => {
    setEditingMembers((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id
          ? { ...updatedMember, isEditing: false }
          : member
      )
    );
  };

  // Add new member
  const addNewMember = async (data: InlineEditFormData) => {
    try {
      const newMemberData: FamilyMemberFormData = {
        full_name: data.full_name,
        birth_year: data.birth_year,
        hometown: '', // Can be derived from ward if needed
        relationship_role: data.relationship_role,
        gender: data.gender,
        is_head_of_household: data.is_head_of_household,
        is_alive: true,
        notes: '',
        province_id: data.province_code,
        ward_id: data.ward_code
      };

      const newMember = await createFamilyMember(householdId, newMemberData);

      setEditingMembers((prev) => [
        ...prev.map((member) =>
          member.is_head_of_household && data.is_head_of_household
            ? { ...member, is_head_of_household: false }
            : member
        ),
        { ...newMember, isEditing: false }
      ]);

      setIsAddingNew(false);

      toast({
        title: 'Thành công',
        description: 'Đã thêm thành viên mới'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>Danh sách thành viên</h3>
        <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
          <Plus className='mr-2 h-4 w-4' />
          Thêm thành viên
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Năm sinh</TableHead>
              <TableHead>Quan hệ</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Tỉnh/TP</TableHead>
              <TableHead>Phường/Xã</TableHead>
              <TableHead>Chủ hộ</TableHead>
              <TableHead className='w-[160px]'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add new member row */}
            {isAddingNew && (
              <AddNewMemberRow
                onSave={addNewMember}
                onCancel={() => setIsAddingNew(false)}
                currentHeadExists={editingMembers.some(
                  (m) => m.is_head_of_household
                )}
              />
            )}

            {/* Existing members */}
            {editingMembers.length === 0 && !isAddingNew ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className='text-muted-foreground text-center'
                >
                  Chưa có thành viên nào. Thêm thành viên đầu tiên.
                </TableCell>
              </TableRow>
            ) : (
              editingMembers.map((member) => (
                <TableRow key={member.id}>
                  {member.isEditing ? (
                    <EditableMemberRow
                      member={member}
                      onSave={(data) => saveMember(member.id, data)}
                      onCancel={() => cancelEdit(member.id)}
                      currentHeadExists={editingMembers.some(
                        (m) => m.id !== member.id && m.is_head_of_household
                      )}
                    />
                  ) : (
                    <ReadOnlyMemberRow
                      member={member}
                      onEdit={() => startEdit(member.id)}
                      onDelete={(name) => deleteMember(member.id, name)}
                      onViewDetail={() => openMemberDetail(member)}
                    />
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={updateMemberFromDrawer}
      />
    </div>
  );
}

// Add new member row component
function AddNewMemberRow({
  onSave,
  onCancel,
  currentHeadExists
}: {
  onSave: (data: InlineEditFormData) => void;
  onCancel: () => void;
  currentHeadExists: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<InlineEditFormData>({
    resolver: zodResolver(inlineEditSchema),
    defaultValues: {
      full_name: '',
      birth_year: new Date().getFullYear() - 30,
      province_code: '',
      ward_code: '',
      relationship_role: RelationshipRole.CON,
      gender: Gender.NAM,
      is_head_of_household: false
    }
  });

  const watchedProvinceCode = watch('province_code');
  const provinces = getProvinces();
  const wards = watchedProvinceCode
    ? getWardsByProvince(watchedProvinceCode)
    : [];

  const handleProvinceChange = (value: string) => {
    setValue('province_code', value);
    setValue('ward_code', '');
  };

  return (
    <>
      <TableCell>
        <Input
          {...register('full_name')}
          placeholder='Nhập họ tên'
          className={errors.full_name ? 'border-red-500' : ''}
        />
      </TableCell>
      <TableCell>
        <Input
          type='number'
          {...register('birth_year', { valueAsNumber: true })}
          placeholder='1990'
          className={errors.birth_year ? 'border-red-500' : ''}
        />
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            setValue('relationship_role', value as RelationshipRole)
          }
        >
          <SelectTrigger
            className={errors.relationship_role ? 'border-red-500' : ''}
          >
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
      </TableCell>
      <TableCell>
        <Select onValueChange={(value) => setValue('gender', value as Gender)}>
          <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
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
      </TableCell>
      <TableCell>
        <Select onValueChange={handleProvinceChange}>
          <SelectTrigger
            className={errors.province_code ? 'border-red-500' : ''}
          >
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
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) => setValue('ward_code', value)}
          disabled={!watchedProvinceCode}
        >
          <SelectTrigger className={errors.ward_code ? 'border-red-500' : ''}>
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
      </TableCell>
      <TableCell>
        <Checkbox
          {...register('is_head_of_household')}
          disabled={currentHeadExists}
          onCheckedChange={(checked) =>
            setValue('is_head_of_household', !!checked)
          }
        />
      </TableCell>
      <TableCell>
        <div className='flex space-x-1'>
          <Button size='sm' variant='outline' onClick={handleSubmit(onSave)}>
            <Save className='h-4 w-4' />
          </Button>
          <Button size='sm' variant='outline' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </TableCell>
    </>
  );
}

// Editable member row component
function EditableMemberRow({
  member,
  onSave,
  onCancel,
  currentHeadExists
}: {
  member: FamilyMember;
  onSave: (data: Partial<FamilyMember>) => void;
  onCancel: () => void;
  currentHeadExists: boolean;
}) {
  const [formData, setFormData] = useState({
    full_name: member.full_name,
    birth_year: member.birth_year,
    relationship_role: member.relationship_role as RelationshipRole,
    gender: (member.gender as Gender) || Gender.NAM,
    province_code: member.province_code || '',
    ward_code: member.ward_code || '',
    is_head_of_household: member.is_head_of_household
  });

  const provinces = getProvinces();
  const wards = formData.province_code
    ? getWardsByProvince(formData.province_code)
    : [];

  const handleSave = () => {
    if (
      !formData.full_name.trim() ||
      !formData.province_code ||
      !formData.ward_code ||
      !formData.relationship_role ||
      !formData.gender
    ) {
      return;
    }
    onSave(formData);
  };

  const handleProvinceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, province_code: value, ward_code: '' }));
  };

  return (
    <>
      <TableCell>
        <Input
          value={formData.full_name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, full_name: e.target.value }))
          }
          placeholder='Nhập họ tên'
        />
      </TableCell>
      <TableCell>
        <Input
          type='number'
          value={formData.birth_year}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              birth_year: parseInt(e.target.value)
            }))
          }
          placeholder='1990'
        />
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              relationship_role: value as RelationshipRole
            }))
          }
          value={formData.relationship_role}
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
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, gender: value as Gender }))
          }
          value={formData.gender}
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
      </TableCell>
      <TableCell>
        <Select
          onValueChange={handleProvinceChange}
          value={formData.province_code}
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
      </TableCell>
      <TableCell>
        <Select
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, ward_code: value }))
          }
          value={formData.ward_code}
          disabled={!formData.province_code}
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
      </TableCell>
      <TableCell>
        <Checkbox
          checked={formData.is_head_of_household}
          disabled={currentHeadExists && !member.is_head_of_household}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              is_head_of_household: !!checked
            }))
          }
        />
      </TableCell>
      <TableCell>
        <div className='flex space-x-1'>
          <Button size='sm' variant='outline' onClick={handleSave}>
            <Save className='h-4 w-4' />
          </Button>
          <Button size='sm' variant='outline' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>
      </TableCell>
    </>
  );
}

// Read-only member row component
function ReadOnlyMemberRow({
  member,
  onEdit,
  onDelete,
  onViewDetail
}: {
  member: FamilyMember;
  onEdit: () => void;
  onDelete: (name: string) => void;
  onViewDetail: () => void;
}) {
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

  return (
    <>
      <TableCell className='font-medium'>
        <div className='flex items-center space-x-2'>
          <span>{member.full_name}</span>
          {member.is_head_of_household && (
            <Crown className='h-4 w-4 text-yellow-500' />
          )}
        </div>
      </TableCell>
      <TableCell>{member.birth_year}</TableCell>
      <TableCell>
        <Badge
          className={getRelationshipColor(
            member.relationship_role as RelationshipRole
          )}
        >
          {getRelationshipLabel(member.relationship_role as RelationshipRole)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant='outline'>
          {getGenderLabel(member.gender as Gender)}
        </Badge>
      </TableCell>
      <TableCell>{getLocationDisplay()}</TableCell>
      <TableCell>{getWardDisplay()}</TableCell>
      <TableCell>
        {member.is_head_of_household ? (
          <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
            Chủ hộ
          </Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        )}
      </TableCell>
      <TableCell>
        <div className='flex space-x-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={onViewDetail}
            className='hover:bg-blue-50'
            title='Xem chi tiết'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button size='sm' variant='outline' onClick={onEdit}>
            <Edit2 className='h-4 w-4' />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='text-red-600 hover:text-red-700'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa thành viên "{member.full_name}"?
                  Thao tác này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(member.full_name)}
                  className='bg-red-600 hover:bg-red-700'
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </>
  );
}
