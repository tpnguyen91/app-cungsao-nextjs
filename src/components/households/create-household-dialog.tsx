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
import { createHousehold } from '@/features/households/actions/household-actions';

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
