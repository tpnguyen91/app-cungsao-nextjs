'use server';

import { URL_GIA_DINH, URL_GIA_DINH_DETAIL } from '@/constants/url';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  householdSchema,
  type HouseholdFormData
} from '../schemas/household-schema';

export async function createHousehold(data: HouseholdFormData) {
  const supabase = await createClient();
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

  revalidatePath(URL_GIA_DINH);
  return household;
}

export async function updateHousehold(id: string, data: HouseholdFormData) {
  const supabase = await createClient();
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

  revalidatePath(URL_GIA_DINH);
  revalidatePath(URL_GIA_DINH_DETAIL(id));
  return household;
}

export async function deleteHousehold(id: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify ownership first
  const { data: household } = await supabase
    .from('households')
    .select('id')
    .eq('id', id)
    .eq('created_by', user.id)
    .single();

  if (!household) {
    throw new Error('Không tìm thấy hộ gia đình hoặc không có quyền xóa');
  }

  // Use RPC function to delete cascade
  const { error } = await supabase.rpc('delete_household_cascade', {
    p_household_id: id
  });

  if (error) {
    throw new Error(`Không thể xóa hộ gia đình: ${error.message}`);
  }

  revalidatePath(URL_GIA_DINH);
}

export async function getHousehold(id: string) {
  const supabase = await createClient();
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
