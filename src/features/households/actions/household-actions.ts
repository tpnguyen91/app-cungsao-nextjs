'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  householdSchema,
  type HouseholdFormData
} from '../schemas/household-schema';

export async function createHousehold(data: HouseholdFormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate data
  const validatedData = householdSchema.parse(data);

  const { data: household, error } = await supabase
    .from('households')
    .insert([
      {
        ...validatedData,
        created_by: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Không thể tạo hộ gia đình: ${error.message}`);
  }

  revalidatePath('/dashboard/households');
  return household;
}

export async function updateHousehold(id: string, data: HouseholdFormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const validatedData = householdSchema.parse(data);

  const { data: household, error } = await supabase
    .from('households')
    .update(validatedData)
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Không thể cập nhật hộ gia đình: ${error.message}`);
  }

  revalidatePath('/dashboard/households');
  revalidatePath(`/dashboard/households/${id}`);
  return household;
}

export async function deleteHousehold(id: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('households')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) {
    throw new Error(`Không thể xóa hộ gia đình: ${error.message}`);
  }

  revalidatePath('/dashboard/households');
}

export async function getHousehold(id: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: household, error } = await supabase
    .from('households')
    .select(
      `
      *,
      head_of_household:family_members!households_head_of_household_id_fkey(
        id,
        full_name
      ),
      family_members(*)
    `
    )
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (error) {
    throw new Error(`Không thể tải thông tin hộ gia đình: ${error.message}`);
  }

  return household;
}
