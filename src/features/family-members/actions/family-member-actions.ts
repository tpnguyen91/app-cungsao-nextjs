'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  familyMemberSchema,
  type FamilyMemberFormData
} from '../schemas/family-member-schema';

export async function createFamilyMember(
  householdId: string,
  data: FamilyMemberFormData
) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validatedData = familyMemberSchema.parse(data);

  // Check if household belongs to user
  const { data: household } = await supabase
    .from('households')
    .select('id')
    .eq('id', householdId)
    .eq('created_by', user.id)
    .single();

  if (!household) {
    throw new Error('Không tìm thấy hộ gia đình');
  }

  const { data: member, error } = await supabase
    .from('family_members')
    .insert([
      {
        ...validatedData,
        household_id: householdId
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Không thể thêm thành viên: ${error.message}`);
  }

  // If this member is head of household, update household and remove head status from others
  if (validatedData.is_head_of_household) {
    await supabase
      .from('households')
      .update({ head_of_household_id: member.id })
      .eq('id', householdId);

    // Remove head status from other members
    await supabase
      .from('family_members')
      .update({ is_head_of_household: false })
      .eq('household_id', householdId)
      .neq('id', member.id);
  }

  revalidatePath(`/dashboard/households/${householdId}`);
  revalidatePath(`/dashboard/households/${householdId}/members`);
  return member;
}

export async function updateFamilyMember(
  id: string,
  data: FamilyMemberFormData
) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validatedData = familyMemberSchema.parse(data);

  // Get member info to check household ownership
  const { data: currentMember } = await supabase
    .from('family_members')
    .select('household_id, households!inner(created_by)')
    .eq('id', id)
    .single();

  if (!currentMember || currentMember.households.created_by !== user.id) {
    throw new Error('Không có quyền cập nhật thành viên này');
  }

  const { data: member, error } = await supabase
    .from('family_members')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Không thể cập nhật thành viên: ${error.message}`);
  }

  // Handle head of household changes
  if (validatedData.is_head_of_household) {
    await supabase
      .from('households')
      .update({ head_of_household_id: member.id })
      .eq('id', member.household_id);

    // Remove head status from other members
    await supabase
      .from('family_members')
      .update({ is_head_of_household: false })
      .eq('household_id', member.household_id)
      .neq('id', member.id);
  }

  revalidatePath(`/dashboard/households/${member.household_id}`);
  revalidatePath(`/dashboard/households/${member.household_id}/members`);
  return member;
}

export async function deleteFamilyMember(id: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get member info to check household ownership
  const { data: member } = await supabase
    .from('family_members')
    .select('household_id, households!inner(created_by)')
    .eq('id', id)
    .single();

  if (!member || member.households.created_by !== user.id) {
    throw new Error('Không có quyền xóa thành viên này');
  }

  const { error } = await supabase.from('family_members').delete().eq('id', id);

  if (error) {
    throw new Error(`Không thể xóa thành viên: ${error.message}`);
  }

  revalidatePath(`/dashboard/households/${member.household_id}`);
  revalidatePath(`/dashboard/households/${member.household_id}/members`);
}

export async function getFamilyMembers(householdId: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: members, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('household_id', householdId)
    .order('is_head_of_household', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Không thể tải danh sách thành viên: ${error.message}`);
  }

  return members;
}
