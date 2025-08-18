'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CreateHouseholdWizard } from './create-household-wizard';
import type { Household, FamilyMember } from '@/types/household';
import { useToast } from '@/hooks/use-toast';

interface CreateHouseholdDialogProps {
  children: React.ReactNode;
}

export function CreateHouseholdDialog({
  children
}: CreateHouseholdDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Get current user
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, [supabase.auth]);

  const handleSuccess = (household: Household, head: FamilyMember) => {
    toast({
      title: 'Thành công!',
      description: `Đã tạo ${household.display_name || 'hộ gia đình'} với chủ hộ ${head.full_name}`
    });

    // Refresh the page to show new household
    router.refresh();
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (!userId) {
    return null; // Don't render if no user
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      <CreateHouseholdWizard
        isOpen={open}
        onClose={handleClose}
        onSuccess={handleSuccess}
        userId={userId}
      />
    </>
  );
}
