'use server';

import { URL_GIA_DINH_DETAIL, URL_GIA_DINH_THANH_VIEN } from '@/constants/url';
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
  const supabase = await createClient();

  const validatedData = familyMemberSchema.parse(data);

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

  revalidatePath(URL_GIA_DINH_DETAIL(householdId));
  revalidatePath(URL_GIA_DINH_THANH_VIEN(householdId));
  return member;
}

export async function updateFamilyMember(
  id: string,
  data: FamilyMemberFormData
) {
  const supabase = await createClient();

  const validatedData = familyMemberSchema.parse(data);

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

  revalidatePath(URL_GIA_DINH_DETAIL(member.household_id));
  revalidatePath(URL_GIA_DINH_THANH_VIEN(member.household_id));
  return member;
}

export async function deleteFamilyMember(id: string, householdId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('family_members').delete().eq('id', id);

  if (error) {
    throw new Error(`Không thể xóa thành viên: ${error.message}`);
  }

  revalidatePath(URL_GIA_DINH_DETAIL(householdId));
  revalidatePath(URL_GIA_DINH_THANH_VIEN(householdId));
}

export async function getFamilyMembers(householdId: string) {
  const supabase = await createClient();

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

export interface MemberSearchResult {
  id: string;
  full_name: string;
  birth_year: number;
  household_id: string;
  household_address: string | null;
  household_province_code: string | null;
  household_ward_code: string | null;
  hometown_address: string | null;
  hometown_province_code: string | null;
  hometown_ward_code: string | null;
  is_head_of_household: boolean;
  relationship_role: string;
  gender: string | null;
}

export async function searchFamilyMembers(searchQuery: string) {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return [];
  }

  const supabase = await createClient();

  // Search members by name and join with household data
  const { data: members, error } = await supabase
    .from('family_members')
    .select(
      `
      id,
      full_name,
      birth_year,
      relationship_role,
      gender,
      is_head_of_household,
      household_id,
      hometown_address,
      hometown_province_code,
      hometown_ward_code,
      households!family_members_household_id_fkey!inner(
        address,
        province_code,
        ward_code
      )
    `
    )
    .ilike('full_name', `%${searchQuery.trim()}%`)
    .limit(50);

  if (error) {
    console.error('Error searching members:', error);
    throw new Error(`Không thể tìm kiếm thành viên: ${error.message}`);
  }

  // Transform the nested data structure
  const results: MemberSearchResult[] =
    members?.map((member: any) => ({
      id: member.id,
      full_name: member.full_name,
      birth_year: member.birth_year,
      household_id: member.household_id,
      household_address: member.households?.address || null,
      household_province_code: member.households?.province_code || null,
      household_ward_code: member.households?.ward_code || null,
      hometown_address: member.hometown_address,
      hometown_province_code: member.hometown_province_code,
      hometown_ward_code: member.hometown_ward_code,
      is_head_of_household: member.is_head_of_household,
      relationship_role: member.relationship_role,
      gender: member.gender
    })) || [];

  return results;
}
