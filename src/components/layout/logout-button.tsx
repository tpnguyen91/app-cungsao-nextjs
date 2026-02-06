'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleSignOut}
      className='text-muted-foreground hover:text-foreground cursor-pointer gap-2'
    >
      <LogOut className='h-4 w-4' />
      Đăng xuất
    </Button>
  );
}
