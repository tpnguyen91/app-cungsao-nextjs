'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createHouseholdWithHead } from '@/lib/household-operations-fixed';
import { getProvinces, getWardsByProvince } from '@/lib/vietnam-data';
import type { FamilyMember, Household } from '@/types/household';
import { Gender } from '@/types/household';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Home, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validation schemas
const householdSchema = z.object({
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  province_code: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  ward_code: z.string().min(1, 'Vui lòng chọn phường/xã'),
  phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  notes: z.string().optional()
});

const headSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  birth_year: z
    .number()
    .min(1900, 'Năm sinh không hợp lệ')
    .max(new Date().getFullYear(), 'Năm sinh không thể lớn hơn năm hiện tại'),
  gender: z.nativeEnum(Gender, { required_error: 'Vui lòng chọn giới tính' }),
  hometown_address: z.string().min(1, 'Vui lòng nhập địa chỉ quê quán'),
  hometown_province_code: z.string().min(1, 'Vui lòng chọn tỉnh quê quán'),
  hometown_ward_code: z.string().min(1, 'Vui lòng chọn phường/xã quê quán'),
  use_same_address: z.boolean().optional(),
  notes: z.string().optional()
});

type HouseholdFormData = z.infer<typeof householdSchema>;
type HeadFormData = z.infer<typeof headSchema>;

interface CreateHouseholdWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (household: Household, head: FamilyMember) => void;
  userId: string;
}

export function CreateHouseholdWizard({
  isOpen,
  onClose,
  onSuccess,
  userId
}: CreateHouseholdWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [householdData, setHouseholdData] = useState<HouseholdFormData | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);

  const { toast } = useToast();

  const provinces = useMemo(() => getProvinces(), []);

  const householdForm = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      address: '',
      province_code: '',
      ward_code: '',
      phone: '',
      notes: ''
    }
  });

  const headForm = useForm<HeadFormData>({
    resolver: zodResolver(headSchema),
    defaultValues: {
      full_name: '',
      birth_year: new Date().getFullYear() - 30,
      gender: Gender.NAM,
      hometown_address: '',
      hometown_province_code: '',
      hometown_ward_code: '',
      use_same_address: true,
      notes: ''
    }
  });

  const householdProvinceCode = householdForm.watch('province_code');
  const headProvinceCode = headForm.watch('hometown_province_code');

  const householdWards = useMemo(
    () =>
      householdProvinceCode ? getWardsByProvince(householdProvinceCode) : [],
    [householdProvinceCode]
  );

  const headWards = useMemo(
    () => (headProvinceCode ? getWardsByProvince(headProvinceCode) : []),
    [headProvinceCode]
  );

  useEffect(() => {
    if (useSameAddress && householdData) {
      headForm.setValue('hometown_address', householdData.address);
      headForm.setValue('hometown_province_code', householdData.province_code);
      headForm.setValue('hometown_ward_code', householdData.ward_code);
    } else if (!useSameAddress) {
      headForm.setValue('hometown_address', '');
      headForm.setValue('hometown_province_code', '');
      headForm.setValue('hometown_ward_code', '');
    }
  }, [useSameAddress, householdData, headForm]);

  const handleStep1Submit = useCallback((data: HouseholdFormData) => {
    setHouseholdData(data);
    setCurrentStep(2);
  }, []);

  const handleStep2Submit = useCallback(
    async (data: HeadFormData) => {
      if (!householdData) return;
      setIsSubmitting(true);
      try {
        const result = await createHouseholdWithHead(
          householdData,
          { ...data, use_same_address: useSameAddress },
          userId
        );
        setCurrentStep(3);
        setTimeout(() => {
          onSuccess(result.household, result.head_member);
          handleClose();
        }, 2000);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Lỗi tạo hộ gia đình',
          description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [householdData, useSameAddress, userId, onSuccess, toast]
  );

  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setHouseholdData(null);
    setUseSameAddress(true);
    householdForm.reset();
    headForm.reset();
    onClose();
  }, [householdForm, headForm, onClose]);

  const steps = [
    { num: 1, label: 'Thông tin hộ' },
    { num: 2, label: 'Chủ hộ' },
    { num: 3, label: 'Hoàn thành' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg overflow-hidden p-0'>
        {/* Header */}
        <DialogHeader className='border-b border-slate-100 px-6 pt-5 pb-4'>
          <DialogTitle className='flex items-center gap-2 text-base font-semibold text-slate-800'>
            <Home className='text-primary h-5 w-5' />
            Tạo hộ gia đình mới
          </DialogTitle>

          {/* Stepper */}
          <div className='mt-4 flex items-center justify-center gap-0'>
            {steps.map((step, i) => (
              <div key={step.num} className='flex items-center'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all ${
                      currentStep > step.num
                        ? 'bg-primary text-white'
                        : currentStep === step.num
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <Check className='h-3.5 w-3.5' />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span
                    className={`text-xs ${currentStep >= step.num ? 'text-slate-700' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-3 h-px w-8 ${currentStep > step.num ? 'bg-primary' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step 1 */}
        {currentStep === 1 && (
          <form onSubmit={householdForm.handleSubmit(handleStep1Submit)}>
            <div className='space-y-4 px-6 py-5'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                  Địa chỉ chi tiết <span className='text-red-500'>*</span>
                </label>
                <Input
                  {...householdForm.register('address')}
                  placeholder='Số nhà, tên đường...'
                  className={`border-slate-200 ${
                    householdForm.formState.errors.address
                      ? 'border-red-400'
                      : ''
                  }`}
                />
                {householdForm.formState.errors.address && (
                  <p className='mt-1 text-xs text-red-500'>
                    {householdForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='w-full'>
                  <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                    Tỉnh/Thành phố <span className='text-red-500'>*</span>
                  </label>
                  <Select
                    value={householdForm.watch('province_code')}
                    onValueChange={(v) => {
                      householdForm.setValue('province_code', v);
                      householdForm.setValue('ward_code', '');
                    }}
                  >
                    <SelectTrigger
                      className={`w-full cursor-pointer border-slate-200 ${householdForm.formState.errors.province_code ? 'border-red-400' : ''}`}
                    >
                      <SelectValue placeholder='Chọn tỉnh/thành phố' />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem
                          key={p.code}
                          value={p.code}
                          className='cursor-pointer'
                        >
                          {p.name_with_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='w-full'>
                  <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                    Phường/Xã <span className='text-red-500'>*</span>
                  </label>
                  <Select
                    value={householdForm.watch('ward_code')}
                    onValueChange={(v) =>
                      householdForm.setValue('ward_code', v)
                    }
                    disabled={!householdForm.watch('province_code')}
                  >
                    <SelectTrigger
                      className={`w-full cursor-pointer border-slate-200 ${householdForm.formState.errors.ward_code ? 'border-red-400' : ''}`}
                    >
                      <SelectValue placeholder='Chọn phường/xã' />
                    </SelectTrigger>
                    <SelectContent>
                      {householdWards.map((w) => (
                        <SelectItem
                          key={w.code}
                          value={w.code}
                          className='cursor-pointer'
                        >
                          {w.name_with_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                  Số điện thoại <span className='text-red-500'>*</span>
                </label>
                <Input
                  {...householdForm.register('phone')}
                  placeholder='0912 345 678'
                  className={`border-slate-200 ${
                    householdForm.formState.errors.phone ? 'border-red-400' : ''
                  }`}
                />
                {householdForm.formState.errors.phone && (
                  <p className='mt-1 text-xs text-red-500'>
                    {householdForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                  Ghi chú
                </label>
                <Textarea
                  {...householdForm.register('notes')}
                  placeholder='Ghi chú thêm (tùy chọn)'
                  rows={2}
                  className='resize-none border-slate-200'
                />
              </div>
            </div>

            <div className='flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                className='cursor-pointer border-slate-200'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90 cursor-pointer'
              >
                Tiếp tục <ArrowRight className='ml-1.5 h-4 w-4' />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2 */}
        {currentStep === 2 && householdData && (
          <form onSubmit={headForm.handleSubmit(handleStep2Submit)}>
            <div className='space-y-4 px-6 py-5'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                    Họ và tên <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    {...headForm.register('full_name')}
                    placeholder='Nguyễn Văn A'
                    className={`border-slate-200 ${
                      headForm.formState.errors.full_name
                        ? 'border-red-400'
                        : ''
                    }`}
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                    Năm sinh <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    type='number'
                    {...headForm.register('birth_year', {
                      valueAsNumber: true
                    })}
                    placeholder='1990'
                    className={`border-slate-200 ${
                      headForm.formState.errors.birth_year
                        ? 'border-red-400'
                        : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700'>
                  Giới tính <span className='text-red-500'>*</span>
                </label>
                <div className='flex gap-3'>
                  {[
                    { value: Gender.NAM, label: 'Nam' },
                    { value: Gender.NU, label: 'Nữ' }
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 transition-all ${
                        headForm.watch('gender') === opt.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type='radio'
                        className='sr-only'
                        checked={headForm.watch('gender') === opt.value}
                        onChange={() => headForm.setValue('gender', opt.value)}
                      />
                      <span className='text-sm font-medium'>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quê quán */}
              <div className='space-y-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-slate-700'>
                    Quê quán
                  </span>
                  <label className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      checked={useSameAddress}
                      onCheckedChange={(c) => setUseSameAddress(c as boolean)}
                      className='data-[state=checked]:border-primary data-[state=checked]:bg-primary'
                    />
                    <span className='text-sm text-slate-600'>
                      Giống địa chỉ hộ
                    </span>
                  </label>
                </div>

                {useSameAddress ? (
                  <p className='bg-primary/5 text-primary rounded-md px-3 py-2 text-sm'>
                    {householdData.address},{' '}
                    {
                      provinces.find(
                        (p) => p.code === householdData.province_code
                      )?.name_with_type
                    }
                  </p>
                ) : (
                  <div className='space-y-3'>
                    <Input
                      {...headForm.register('hometown_address')}
                      placeholder='Địa chỉ quê quán'
                      className='border-slate-200 bg-white'
                    />
                    <div className='grid grid-cols-2 gap-3'>
                      <Select
                        value={headForm.watch('hometown_province_code')}
                        onValueChange={(v) => {
                          headForm.setValue('hometown_province_code', v);
                          headForm.setValue('hometown_ward_code', '');
                        }}
                      >
                        <SelectTrigger className='cursor-pointer border-slate-200 bg-white'>
                          <SelectValue placeholder='Tỉnh/TP' />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((p) => (
                            <SelectItem
                              key={p.code}
                              value={p.code}
                              className='cursor-pointer'
                            >
                              {p.name_with_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={headForm.watch('hometown_ward_code')}
                        onValueChange={(v) =>
                          headForm.setValue('hometown_ward_code', v)
                        }
                        disabled={!headForm.watch('hometown_province_code')}
                      >
                        <SelectTrigger className='cursor-pointer border-slate-200 bg-white'>
                          <SelectValue placeholder='Phường/Xã' />
                        </SelectTrigger>
                        <SelectContent>
                          {headWards.map((w) => (
                            <SelectItem
                              key={w.code}
                              value={w.code}
                              className='cursor-pointer'
                            >
                              {w.name_with_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {headForm.watch('full_name') && (
                <p className='rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600'>
                  Tên hộ:{' '}
                  <span className='font-medium text-slate-800'>
                    Gia đình {headForm.watch('full_name')}
                  </span>
                </p>
              )}
            </div>

            <div className='flex justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setCurrentStep(1)}
                className='cursor-pointer border-slate-200'
              >
                <ArrowLeft className='mr-1.5 h-4 w-4' /> Quay lại
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-primary hover:bg-primary/90 cursor-pointer'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> Đang
                    tạo...
                  </>
                ) : (
                  'Tạo hộ gia đình'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <div className='px-6 py-10 text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
              <Check className='text-primary h-8 w-8' />
            </div>
            <h3 className='mb-1 text-lg font-semibold text-slate-800'>
              Tạo thành công!
            </h3>
            <p className='mb-6 text-sm text-slate-600'>
              Hộ gia đình{' '}
              <span className='text-primary font-medium'>
                "Gia đình {headForm.watch('full_name')}"
              </span>{' '}
              đã được tạo
            </p>
            <div className='flex items-center justify-center gap-2 text-sm text-slate-400'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Đang chuyển về danh sách...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
