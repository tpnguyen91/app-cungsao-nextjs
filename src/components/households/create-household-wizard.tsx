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
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Home,
  Loader2,
  MapPin,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const provinces = getProvinces();

  // Step 1: Household form
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

  // Step 2: Head form
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

  // Get wards based on selected province
  const householdWards = householdForm.watch('province_code')
    ? getWardsByProvince(householdForm.watch('province_code'))
    : [];

  const headWards = headForm.watch('hometown_province_code')
    ? getWardsByProvince(headForm.watch('hometown_province_code'))
    : [];

  // Auto-fill head hometown when useSameAddress changes
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

  // Handle step 1 submission
  const handleStep1Submit = (data: HouseholdFormData) => {
    setHouseholdData(data);
    setCurrentStep(2);
  };

  // Handle step 2 submission
  const handleStep2Submit = async (data: HeadFormData) => {
    if (!householdData) return;

    setIsSubmitting(true);
    try {
      const result = await createHouseholdWithHead(
        householdData,
        {
          ...data,
          use_same_address: useSameAddress
        },
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
  };

  // Handle province change in household form
  const handleHouseholdProvinceChange = (value: string) => {
    householdForm.setValue('province_code', value);
    householdForm.setValue('ward_code', '');
  };

  // Handle province change in head form
  const handleHeadProvinceChange = (value: string) => {
    headForm.setValue('hometown_province_code', value);
    headForm.setValue('hometown_ward_code', '');
  };

  // Reset and close
  const handleClose = () => {
    setCurrentStep(1);
    setHouseholdData(null);
    setUseSameAddress(true);
    householdForm.reset();
    headForm.reset();
    onClose();
  };

  // Go back to step 1
  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const renderProgressIndicator = () => {
    return (
      <div className='mb-6 flex items-center justify-center'>
        <div className='flex items-center space-x-4'>
          {/* Step 1 */}
          <div className='flex items-center'>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > 1 ? <CheckCircle className='h-4 w-4' /> : '1'}
            </div>
            <span className='ml-2 text-sm font-medium'>Thông tin hộ</span>
          </div>

          <div className='h-0.5 w-8 bg-gray-300'></div>

          {/* Step 2 */}
          <div className='flex items-center'>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 2
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > 2 ? <CheckCircle className='h-4 w-4' /> : '2'}
            </div>
            <span className='ml-2 text-sm font-medium'>Thông tin chủ hộ</span>
          </div>

          <div className='h-0.5 w-8 bg-gray-300'></div>

          {/* Step 3 */}
          <div className='flex items-center'>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                currentStep >= 3
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep >= 3 ? <CheckCircle className='h-4 w-4' /> : '3'}
            </div>
            <span className='ml-2 text-sm font-medium'>Hoàn thành</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Home className='h-5 w-5 text-blue-500' />
            <span>Tạo hộ gia đình mới</span>
          </DialogTitle>
        </DialogHeader>

        {renderProgressIndicator()}

        {/* Step 1: Household Information */}
        {currentStep === 1 && (
          <form
            onSubmit={householdForm.handleSubmit(handleStep1Submit)}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <Home className='h-5 w-5 text-blue-500' />
                <span>Thông tin hộ gia đình</span>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    🏠 Địa chỉ chi tiết *
                  </label>
                  <Input
                    {...householdForm.register('address')}
                    placeholder='Nhập số nhà, tên đường...'
                    className={
                      householdForm.formState.errors.address
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {householdForm.formState.errors.address && (
                    <p className='mt-1 text-xs text-red-500'>
                      {householdForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      📍 Tỉnh/Thành phố *
                    </label>
                    <Select
                      value={householdForm.watch('province_code')}
                      onValueChange={handleHouseholdProvinceChange}
                    >
                      <SelectTrigger
                        className={
                          householdForm.formState.errors.province_code
                            ? 'border-red-500'
                            : ''
                        }
                      >
                        <SelectValue placeholder='Chọn tỉnh/thành phố' />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name_with_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {householdForm.formState.errors.province_code && (
                      <p className='mt-1 text-xs text-red-500'>
                        {householdForm.formState.errors.province_code.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      🏘️ Phường/Xã *
                    </label>
                    <Select
                      value={householdForm.watch('ward_code')}
                      onValueChange={(value) =>
                        householdForm.setValue('ward_code', value)
                      }
                      disabled={!householdForm.watch('province_code')}
                    >
                      <SelectTrigger
                        className={
                          householdForm.formState.errors.ward_code
                            ? 'border-red-500'
                            : ''
                        }
                      >
                        <SelectValue placeholder='Chọn phường/xã' />
                      </SelectTrigger>
                      <SelectContent>
                        {householdWards.map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.name_with_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {householdForm.formState.errors.ward_code && (
                      <p className='mt-1 text-xs text-red-500'>
                        {householdForm.formState.errors.ward_code.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    📞 Số điện thoại *
                  </label>
                  <Input
                    {...householdForm.register('phone')}
                    placeholder='Nhập số điện thoại liên hệ'
                    className={
                      householdForm.formState.errors.phone
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    💡 Số điện thoại dùng để phân biệt các hộ gia đình
                  </p>
                  {householdForm.formState.errors.phone && (
                    <p className='mt-1 text-xs text-red-500'>
                      {householdForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    📝 Ghi chú
                  </label>
                  <Textarea
                    {...householdForm.register('notes')}
                    placeholder='Ghi chú thêm về hộ gia đình (tùy chọn)'
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-3'>
              <Button type='button' variant='outline' onClick={handleClose}>
                Hủy
              </Button>
              <Button type='submit'>
                Tiếp tục
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Head of Household */}
        {currentStep === 2 && householdData && (
          <form
            onSubmit={headForm.handleSubmit(handleStep2Submit)}
            className='space-y-6'
          >
            <div className='space-y-4'>
              <div className='flex items-center space-x-2 text-lg font-semibold text-gray-800'>
                <User className='h-5 w-5 text-green-500' />
                <span>Thông tin chủ hộ</span>
              </div>

              {/* Basic Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    👤 Họ và tên *
                  </label>
                  <Input
                    {...headForm.register('full_name')}
                    placeholder='Nhập họ và tên chủ hộ'
                    className={
                      headForm.formState.errors.full_name
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {headForm.formState.errors.full_name && (
                    <p className='mt-1 text-xs text-red-500'>
                      {headForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    📅 Năm sinh *
                  </label>
                  <Input
                    type='number'
                    {...headForm.register('birth_year', {
                      valueAsNumber: true
                    })}
                    placeholder='1990'
                    className={
                      headForm.formState.errors.birth_year
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {headForm.formState.errors.birth_year && (
                    <p className='mt-1 text-xs text-red-500'>
                      {headForm.formState.errors.birth_year.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  🚻 Giới tính *
                </label>
                <Select
                  value={headForm.watch('gender')}
                  onValueChange={(value) =>
                    headForm.setValue('gender', value as Gender)
                  }
                >
                  <SelectTrigger
                    className={
                      headForm.formState.errors.gender ? 'border-red-500' : ''
                    }
                  >
                    <SelectValue placeholder='Chọn giới tính' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.NAM}>Nam</SelectItem>
                    <SelectItem value={Gender.NU}>Nữ</SelectItem>
                  </SelectContent>
                </Select>
                {headForm.formState.errors.gender && (
                  <p className='mt-1 text-xs text-red-500'>
                    {headForm.formState.errors.gender.message}
                  </p>
                )}
              </div>

              {/* Hometown Section */}
              <div className='space-y-4 rounded-lg border p-4'>
                <div className='flex items-center space-x-2'>
                  <MapPin className='h-4 w-4 text-blue-500' />
                  <span className='font-medium text-gray-700'>
                    Thông tin quê quán
                  </span>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    checked={useSameAddress}
                    onCheckedChange={setUseSameAddress}
                  />
                  <label className='text-sm text-gray-600'>
                    Giống địa chỉ hộ gia đình
                  </label>
                </div>

                {useSameAddress ? (
                  <div className='rounded-md border border-blue-200 bg-blue-50 p-3'>
                    <div className='text-sm text-blue-700'>
                      📍 {householdData.address},{' '}
                      {
                        provinces.find(
                          (p) => p.code === householdData.province_code
                        )?.name_with_type
                      }
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium text-gray-700'>
                        🏠 Địa chỉ quê quán *
                      </label>
                      <Input
                        {...headForm.register('hometown_address')}
                        placeholder='Nhập địa chỉ quê quán'
                        className={
                          headForm.formState.errors.hometown_address
                            ? 'border-red-500'
                            : ''
                        }
                      />
                      {headForm.formState.errors.hometown_address && (
                        <p className='mt-1 text-xs text-red-500'>
                          {headForm.formState.errors.hometown_address.message}
                        </p>
                      )}
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          📍 Tỉnh/Thành phố *
                        </label>
                        <Select
                          value={headForm.watch('hometown_province_code')}
                          onValueChange={handleHeadProvinceChange}
                        >
                          <SelectTrigger
                            className={
                              headForm.formState.errors.hometown_province_code
                                ? 'border-red-500'
                                : ''
                            }
                          >
                            <SelectValue placeholder='Chọn tỉnh quê quán' />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem
                                key={province.code}
                                value={province.code}
                              >
                                {province.name_with_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {headForm.formState.errors.hometown_province_code && (
                          <p className='mt-1 text-xs text-red-500'>
                            {
                              headForm.formState.errors.hometown_province_code
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label className='text-sm font-medium text-gray-700'>
                          🏘️ Phường/Xã *
                        </label>
                        <Select
                          value={headForm.watch('hometown_ward_code')}
                          onValueChange={(value) =>
                            headForm.setValue('hometown_ward_code', value)
                          }
                          disabled={!headForm.watch('hometown_province_code')}
                        >
                          <SelectTrigger
                            className={
                              headForm.formState.errors.hometown_ward_code
                                ? 'border-red-500'
                                : ''
                            }
                          >
                            <SelectValue placeholder='Chọn phường/xã' />
                          </SelectTrigger>
                          <SelectContent>
                            {headWards.map((ward) => (
                              <SelectItem key={ward.code} value={ward.code}>
                                {ward.name_with_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {headForm.formState.errors.hometown_ward_code && (
                          <p className='mt-1 text-xs text-red-500'>
                            {
                              headForm.formState.errors.hometown_ward_code
                                .message
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  📝 Ghi chú
                </label>
                <Textarea
                  {...headForm.register('notes')}
                  placeholder='Ghi chú về chủ hộ (tùy chọn)'
                  rows={2}
                />
              </div>

              {/* Preview */}
              {headForm.watch('full_name') && (
                <div className='rounded-md border border-green-200 bg-green-50 p-3'>
                  <div className='text-sm text-green-700'>
                    💡 Tên hộ gia đình sẽ là:{' '}
                    <strong>"Gia đình {headForm.watch('full_name')}"</strong>
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-between'>
              <Button
                type='button'
                variant='outline'
                onClick={handleBackToStep1}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Quay lại
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang tạo...
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
          <div className='space-y-6 py-8 text-center'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>

            <div>
              <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                🎉 Tạo thành công!
              </h3>
              <p className='text-gray-600'>
                Đã tạo hộ gia đình{' '}
                <strong>"Gia đình {headForm.watch('full_name')}"</strong>
              </p>
            </div>

            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <h4 className='mb-2 font-medium text-blue-900'>
                Tiếp theo bạn có thể:
              </h4>
              <ul className='space-y-1 text-sm text-blue-700'>
                <li>• Thêm thành viên khác vào hộ gia đình</li>
                <li>• Chỉnh sửa thông tin vừa tạo</li>
                <li>• Quản lý lịch cúng của gia đình</li>
              </ul>
            </div>

            <p className='text-sm text-gray-500'>Đang chuyển về danh sách...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
