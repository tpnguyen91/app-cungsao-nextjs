'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  householdSchema,
  type HouseholdFormData
} from '@/features/households/schemas/household-schema';
import { updateHousehold } from '@/features/households/actions/household-actions';
import { getProvinces, getWardsByProvince } from '@/lib/vietnam-data';

interface Household {
  id: string;
  household_name: string;
  address: string;
  province_code?: string;
  ward_code?: string;
}

interface EditHouseholdDialogProps {
  children: React.ReactNode;
  household: Household;
}

export function EditHouseholdDialog({
  children,
  household
}: EditHouseholdDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const provinces = useMemo(() => getProvinces(), []);

  const form = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      household_name: '',
      address: '',
      province_code: '',
      ward_code: ''
    }
  });

  // Reset form when dialog opens with household data
  useEffect(() => {
    if (open) {
      form.reset({
        household_name: household.household_name || '',
        address: household.address || '',
        province_code: household.province_code || '',
        ward_code: household.ward_code || ''
      });
    }
  }, [open, household, form]);

  const selectedProvinceCode = form.watch('province_code');
  const wards = useMemo(
    () =>
      selectedProvinceCode ? getWardsByProvince(selectedProvinceCode) : [],
    [selectedProvinceCode]
  );

  const onSubmit = async (data: HouseholdFormData) => {
    try {
      await updateHousehold(household.id, data);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin hộ gia đình'
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hộ gia đình</DialogTitle>
          <DialogDescription>Cập nhật thông tin hộ gia đình</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='household_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hộ gia đình</FormLabel>
                  <FormControl>
                    <Input placeholder='Gia đình Nguyễn Văn A' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='province_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('ward_code', '');
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className='cursor-pointer'>
                          <SelectValue placeholder='Chọn tỉnh/thành phố' />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='ward_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phường/Xã</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedProvinceCode}
                    >
                      <FormControl>
                        <SelectTrigger className='cursor-pointer'>
                          <SelectValue placeholder='Chọn phường/xã' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards.map((w) => (
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Số nhà, tên đường...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                className='cursor-pointer'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
                className='cursor-pointer'
              >
                {form.formState.isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
