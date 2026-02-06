'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { Loader2, RotateCcw, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  member?: FamilyMember | null;
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

  const form = useForm<FormData>({
    resolver: zodResolver(familyMemberFormSchema),
    defaultValues: {
      full_name: member?.full_name || '',
      dharma_name: member?.dharma_name || '',
      birth_year: member?.birth_year || new Date().getFullYear() - 30,
      gender: (member?.gender as Gender) || Gender.NAM
    }
  });

  const isSubmitting = externalIsSubmitting || form.formState.isSubmitting;
  const watchedBirthYear = form.watch('birth_year');
  const currentAge = watchedBirthYear
    ? new Date().getFullYear() - watchedBirthYear
    : 0;

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && member) {
        const updateData: FamilyMemberFormData = {
          full_name: data.full_name,
          dharma_name: data.dharma_name || '',
          birth_year: data.birth_year,
          gender: data.gender,
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
        const newMemberData: FamilyMemberFormData = {
          full_name: data.full_name,
          dharma_name: data.dharma_name || '',
          birth_year: data.birth_year,
          gender: data.gender,
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

  const handleReset = () => {
    form.reset({
      full_name: member?.full_name || '',
      dharma_name: member?.dharma_name || '',
      birth_year: member?.birth_year || new Date().getFullYear() - 30,
      gender: (member?.gender as Gender) || Gender.NAM
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
        {/* Row 1: Họ tên + Pháp danh */}
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='full_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700'>
                  Họ tên <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Nguyễn Văn A'
                    disabled={isSubmitting}
                    className='focus:border-primary focus:ring-primary/20 border-slate-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dharma_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700'>
                  Pháp danh
                  <span className='ml-1 text-xs text-slate-400'>
                    (tùy chọn)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Thích Minh Tâm'
                    disabled={isSubmitting}
                    className='focus:border-primary focus:ring-primary/20 border-slate-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Năm sinh + Giới tính */}
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='birth_year'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700'>
                  Năm sinh <span className='text-red-500'>*</span>
                  {currentAge > 0 && (
                    <span className='ml-1 text-xs text-slate-400'>
                      ({currentAge} tuổi)
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='number'
                    placeholder='1990'
                    min={1900}
                    max={new Date().getFullYear()}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    className='focus:border-primary focus:ring-primary/20 border-slate-200'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700'>
                  Giới tính <span className='text-red-500'>*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className='focus:border-primary focus:ring-primary/20 border-slate-200'>
                      <SelectValue placeholder='Chọn giới tính' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDER_OPTIONS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {GENDER_LABELS[gender]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between border-t border-slate-100 pt-4'>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onCancel}
              disabled={isSubmitting}
              className='cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            >
              <X className='mr-1.5 h-4 w-4' />
              Hủy
            </Button>
            {!isEditing && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleReset}
                disabled={isSubmitting}
                className='cursor-pointer text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              >
                <RotateCcw className='mr-1.5 h-4 w-4' />
                Đặt lại
              </Button>
            )}
          </div>

          <Button
            type='submit'
            size='sm'
            disabled={isSubmitting}
            className='bg-primary hover:bg-primary/90 cursor-pointer'
          >
            {isSubmitting ? (
              <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-1.5 h-4 w-4' />
            )}
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default FamilyMemberForm;
