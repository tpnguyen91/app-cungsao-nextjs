'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HouseholdDetailDrawer } from '@/components/households/household-detail-drawer';
import type { FamilyMember } from '@/types/database';

interface Household {
  id: string;
  household_name: string;
  household_head?: string;
  address?: string;
  province_code?: string;
  ward_code?: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface HouseholdDrawerManagerProps {
  children: React.ReactNode;
  userId: string;
}

export function HouseholdDrawerManager({
  children,
  userId
}: HouseholdDrawerManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null
  );
  const [householdMembers, setHouseholdMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const householdId = searchParams.get('household');

  useEffect(() => {
    if (householdId) {
      loadHouseholdData(householdId);
    } else {
      setIsDrawerOpen(false);
      setSelectedHousehold(null);
      setHouseholdMembers([]);
    }
  }, [householdId, userId]);

  const loadHouseholdData = async (id: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Get household data
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', id)
        .eq('created_by', userId)
        .single();

      if (householdError || !household) {
        console.error('Household not found:', householdError);
        closeDrawer();
        return;
      }

      // Get family members
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('household_id', id)
        .order('is_head_of_household', { ascending: false })
        .order('created_at', { ascending: true });

      if (membersError) {
        console.error('Error fetching family members:', membersError);
      }

      setSelectedHousehold(household);
      setHouseholdMembers(members || []);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error loading household data:', error);
      closeDrawer();
    } finally {
      setIsLoading(false);
    }
  };

  const closeDrawer = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete('household');
    const newUrl = currentParams.toString()
      ? `?${currentParams.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const updateHousehold = (updatedHousehold: Household) => {
    setSelectedHousehold(updatedHousehold);
  };

  return (
    <>
      {children}

      <HouseholdDetailDrawer
        household={selectedHousehold}
        members={householdMembers}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onUpdate={updateHousehold}
      />
    </>
  );
}
