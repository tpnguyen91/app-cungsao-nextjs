'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import {
  householdSchema,
  type HouseholdFormData
} from '@/features/households/schemas/household-schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { createHousehold } from '@/features/households/actions/household-actions';
import ProvinceData from '../../data/province.json';
import WardData from '../../data/ward.json';
import { IProvince, IWard } from '@/types';

interface CreateHouseholdDialogProps {
  children: React.ReactNode;
}

export function CreateHouseholdDialog({
  children
}: CreateHouseholdDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      household_name: '',
      address: '',
      province_id: '',
      ward_id: ''
    }
  });

  const watchedProvince = form.watch('province_id') as string;

  const provinces = Object.keys(ProvinceData as Record<string, IProvince>).map(
    (provinceCode: string) => ({
      ...(ProvinceData as Record<string, IProvince>)[provinceCode]
    })
  );
  const wardsData = watchedProvince
    ? Object.keys(WardData)
        .filter(
          (k) =>
            (WardData as Record<string, IWard>)[k].parent_code ===
            watchedProvince
        )
        .map((ward) => ({ ...(WardData as Record<string, IWard>)[ward] }))
    : [];

  const onSubmit = async (data: HouseholdFormData) => {
    try {
      await createHousehold(data);
      toast({
        title: 'Thành công',
        description: 'Đã tạo hộ gia đình mới'
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    }
  };

  const handleProvinceChange = (value: string) => {
    form.setValue('province_id', value);
    form.setValue('ward_id', '');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Thêm hộ gia đình mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản của hộ gia đình
          </DialogDescription>
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
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='123 Đường ABC, Quận 1, TP.HCM'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='w-full flex-1'>
              <FormField
                control={form.control}
                name='province_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố</FormLabel>
                    <Select
                      onValueChange={handleProvinceChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chọn tỉnh/TP' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[200px] overflow-y-auto'>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='w-full flex-1'>
              <FormField
                control={form.control}
                name='ward_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phường/Xã</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedProvince}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chọn phường/xã' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[200px] overflow-y-auto'>
                        {wardsData.map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.path_with_type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
                className='bg-pink-600 hover:bg-pink-700'
              >
                {form.formState.isSubmitting
                  ? 'Đang tạo...'
                  : 'Tạo hộ gia đình'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
