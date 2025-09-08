'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { URL_GIA_DINH } from '@/constants/url';
import {
  signInSchema,
  type SignInFormData
} from '@/features/auth/schemas/auth-schema';
import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Home, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: SignInFormData) => {
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        setError(error.message);
      } else {
        router.push(URL_GIA_DINH);
        router.refresh();
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <Card className='border-0 bg-white/80 shadow-2xl backdrop-blur-sm'>
      <CardHeader className='space-y-1 text-center'>
        <div className='mb-4 flex items-center justify-center'>
          <div className='rounded-full bg-blue-100 p-3'>
            <Home className='h-8 w-8 text-blue-600' />
          </div>
        </div>
        <CardTitle className='text-2xl font-bold'>
          Quản lý Hộ Gia Đình
        </CardTitle>
        <CardDescription className='text-gray-600'>
          Đăng nhập để quản lý thông tin gia đình và lịch cúng
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Mail className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                      <Input
                        type='email'
                        placeholder='name@example.com'
                        className='pl-10'
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Lock className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu'
                        className='pr-10 pl-10'
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                        disabled={form.formState.isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </Form>

        <div className='text-center'>
          <p className='mt-4 text-xs text-gray-500'>
            Demo account: admin@example.com / password123
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
