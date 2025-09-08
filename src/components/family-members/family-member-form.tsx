'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  createFamilyMember,
  updateFamilyMember
} from '@/features/family-members/actions/family-member-actions';
import {
  Gender,
  GENDER_LABELS,
  GENDER_OPTIONS,
  type FamilyMemberFormData
} from '@/features/family-members/schemas/family-member-schema';
import { useToast } from '@/hooks/use-toast';
import type { FamilyMember } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schema with validation
const familyMemberFormSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  dharma_name: z.string().optional(),
  birth_year: z
    .number()
    .min(1900, 'Năm sinh không hợp lệ')
    .max(new Date().getFullYear(), 'Năm sinh không thể lớn hơn năm hiện tại'),
  gender: z.nativeEnum(Gender, {
    required_error: 'Vui lòng chọn giới tính'
  })
});

type FormData = z.infer<typeof familyMemberFormSchema>;

interface FamilyMemberFormProps {
  member?: FamilyMember | null; // null for create, FamilyMember for edit
  householdId: string;
  onSuccess: (member: FamilyMember) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FamilyMemberForm({
  member,
  householdId,
  onSuccess,
  onCancel,
  isSubmitting: externalIsSubmitting
}: FamilyMemberFormProps) {
  const { toast } = useToast();
  const isEditing = !!member;
  console.log({ member });
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting: internalIsSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(familyMemberFormSchema),
    defaultValues: {
      full_name: member?.full_name || '',
      dharma_name: member?.dharma_name || '',
      birth_year: member?.birth_year || new Date().getFullYear() - 30,
      gender: (member?.gender as Gender) || Gender.NAM
    }
  });

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  // Calculate age from birth year
  const watchedBirthYear = watch('birth_year');
  const currentAge = watchedBirthYear
    ? new Date().getFullYear() - watchedBirthYear
    : 0;

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && member) {
        // Update existing member
        const updateData: FamilyMemberFormData = {
          full_name: data.full_name,
          dharma_name: data.dharma_name || '',
          birth_year: data.birth_year,
          gender: data.gender,
          // Preserve existing values for other required fields
          is_head_of_household: member.is_head_of_household,
          is_alive: member.is_alive ?? true
        };

        const updatedMember = await updateFamilyMember(member.id, updateData);

        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thông tin thành viên'
        });

        onSuccess({ ...member, ...updatedMember });
      } else {
        // Create new member
        const newMemberData: FamilyMemberFormData = {
          full_name: data.full_name,
          dharma_name: data.dharma_name || '',
          birth_year: data.birth_year,
          gender: data.gender,
          // Default values for other required fields
          is_head_of_household: false,
          is_alive: true
        };

        const newMember = await createFamilyMember(householdId, newMemberData);

        toast({
          title: 'Thành công',
          description: 'Đã thêm thành viên mới'
        });

        onSuccess(newMember);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  // Handle gender selection
  const handleGenderChange = (value: string) => {
    setValue('gender', value as Gender);
  };

  // Reset form (useful for create mode)
  const handleReset = () => {
    reset({
      full_name: member?.full_name || '',
      dharma_name: member?.dharma_name || '',
      birth_year: member?.birth_year || new Date().getFullYear() - 30,
      gender: (member?.gender as Gender) || Gender.NAM
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid gap-4'>
        {/* Họ tên */}
        <div className='space-y-2'>
          <Label htmlFor='full_name'>
            Họ tên <span className='text-red-500'>*</span>
          </Label>
          <Input
            id='full_name'
            {...register('full_name')}
            placeholder='Nhập họ và tên đầy đủ'
            className={errors.full_name ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.full_name && (
            <p className='text-sm font-medium text-red-500'>
              {errors.full_name.message}
            </p>
          )}
        </div>

        {/* Pháp danh */}
        <div className='space-y-2'>
          <Label htmlFor='dharma_name'>
            Pháp danh
            <span className='text-muted-foreground ml-2 text-sm'>
              (tùy chọn)
            </span>
          </Label>
          <Input
            id='dharma_name'
            {...register('dharma_name')}
            placeholder='Nhập pháp danh (nếu có)'
            disabled={isSubmitting}
          />
        </div>

        <div className='flex flex-row space-x-4'>
          {/* Năm sinh */}
          <div className='flex-1 space-y-2'>
            <Label htmlFor='birth_year'>
              Năm sinh <span className='text-red-500'>*</span>
              {currentAge > 0 && (
                <span className='text-muted-foreground ml-2 text-sm'>
                  ({currentAge} tuổi)
                </span>
              )}
            </Label>
            <Input
              id='birth_year'
              type='number'
              {...register('birth_year', { valueAsNumber: true })}
              placeholder='VD: 1990'
              min='1900'
              max={new Date().getFullYear()}
              className={errors.birth_year ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.birth_year && (
              <p className='text-sm font-medium text-red-500'>
                {errors.birth_year.message}
              </p>
            )}
          </div>

          {/* Giới tính */}
          <div className='flex-1 space-y-2'>
            <Label htmlFor='gender'>
              Giới tính <span className='text-red-500'>*</span>
            </Label>
            <Select
              onValueChange={handleGenderChange}
              value={watch('gender')}
              disabled={isSubmitting}
            >
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
            {errors.gender && (
              <p className='text-sm font-medium text-red-500'>
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className='flex items-center justify-between border-t pt-4'>
        <div className='flex space-x-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          {!isEditing && (
            <Button
              type='button'
              variant='ghost'
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Đặt lại
            </Button>
          )}
        </div>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && (
            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
          )}
          {isEditing ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </div>

      {/* Helper text */}
      <div className='text-muted-foreground text-sm'>
        <p className='flex items-center'>
          <span className='mr-1 text-red-500'>*</span>
          Thông tin bắt buộc
        </p>
      </div>
    </form>
  );
}

export default FamilyMemberForm;
