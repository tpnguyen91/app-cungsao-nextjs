// Business logic functions for new household schema
// File: src/lib/household-operations.ts

import { createClient } from '@/lib/supabase/client';
import type {
  CreateHouseholdData,
  CreateHeadOfHouseholdData,
  CreateMemberData,
  Household,
  FamilyMember,
  TransferHeadshipData,
  CreateHouseholdResponse,
  TransferHeadshipResponse
} from '@/types/household';

const supabase = createClient();

/**
 * Create a new household with head of household in a single transaction
 */
export async function createHouseholdWithHead(
  householdData: CreateHouseholdData,
  headData: CreateHeadOfHouseholdData,
  userId: string
): Promise<CreateHouseholdResponse> {
  try {
    // Start transaction
    const { data, error } = await supabase.rpc('create_household_with_head', {
      household_data: {
        address: householdData.address,
        province_code: householdData.province_code,
        ward_code: householdData.ward_code,
        phone: householdData.phone,
        notes: householdData.notes || null,
        created_by: userId
      },
      head_data: {
        full_name: headData.full_name,
        birth_year: headData.birth_year,
        gender: headData.gender,
        hometown_address: headData.hometown_address,
        hometown_province_code: headData.hometown_province_code,
        hometown_ward_code: headData.hometown_ward_code,
        relationship_role: 'CHU_HO',
        is_head_of_household: true,
        is_alive: true,
        notes: headData.notes || null
      }
    });

    if (error) throw error;

    // Fetch the created household with head info
    const { data: household, error: fetchError } = await supabase
      .from('households')
      .select(
        `
        *,
        head_of_household:family_members!households_head_of_household_id_fkey(*)
      `
      )
      .eq('id', data.household_id)
      .single();

    if (fetchError) throw fetchError;

    return {
      household: household,
      head_member: household.head_of_household,
      success: true,
      message: 'Tạo hộ gia đình thành công!'
    };
  } catch (error: any) {
    console.error('Error creating household with head:', error);

    // Handle specific error cases
    if (
      error.message?.includes('duplicate key value violates unique constraint')
    ) {
      if (error.message.includes('phone')) {
        throw new Error(
          'Số điện thoại này đã được sử dụng cho hộ gia đình khác'
        );
      }
    }

    throw new Error(error.message || 'Có lỗi xảy ra khi tạo hộ gia đình');
  }
}

/**
 * Add a new family member to existing household
 */
export async function addFamilyMember(
  householdId: string,
  memberData: CreateMemberData
): Promise<FamilyMember> {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        household_id: householdId,
        full_name: memberData.full_name,
        birth_year: memberData.birth_year,
        relationship_role: memberData.relationship_role,
        gender: memberData.gender,
        hometown_address: memberData.hometown_address,
        hometown_province_code: memberData.hometown_province_code,
        hometown_ward_code: memberData.hometown_ward_code,
        is_head_of_household: false,
        is_alive: true,
        notes: memberData.notes || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding family member:', error);
    const err = error as Error;
    throw new Error(err.message || 'Có lỗi xảy ra khi thêm thành viên');
  }
}

/**
 * Transfer headship to another member
 */
export async function transferHeadship(
  transferData: TransferHeadshipData
): Promise<TransferHeadshipResponse> {
  try {
    // Use stored procedure for atomic operation
    const { error } = await supabase.rpc('transfer_headship', {
      household_id: transferData.household_id,
      new_head_id: transferData.new_head_id
    });

    if (error) throw error;

    // Fetch updated household data
    const { data: household, error: fetchError } = await supabase
      .from('households')
      .select(
        `
        *,
        head_of_household:family_members!households_head_of_household_id_fkey(*),
        family_members(*)
      `
      )
      .eq('id', transferData.household_id)
      .single();

    if (fetchError) throw fetchError;

    const newHead = household.family_members.find(
      (m: FamilyMember) => m.id === transferData.new_head_id
    );
    const oldHead = household.family_members.find(
      (m: FamilyMember) => m.id === transferData.current_head_id
    );

    return {
      household,
      old_head: oldHead!,
      new_head: newHead!,
      success: true,
      message: 'Đã chuyển quyền chủ hộ thành công!'
    };
  } catch (error) {
    console.error('Error transferring headship:', error);
    const err = error as Error;
    throw new Error(err.message || 'Có lỗi xảy ra khi chuyển quyền chủ hộ');
  }
}

/**
 * Delete entire household with all members (cascade)
 */
export async function deleteHouseholdCascade(
  householdId: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('delete_household_cascade', {
      household_id: householdId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting household:', error);
    const err = error as Error;
    throw new Error(err.message || 'Có lỗi xảy ra khi xóa hộ gia đình');
  }
}

/**
 * Delete a family member (with head protection)
 */
export async function deleteFamilyMember(memberId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      // Trigger will prevent deletion of head of household
      if (error.message?.includes('Cannot delete head of household')) {
        throw new Error(
          'Không thể xóa chủ hộ. Vui lòng chọn chủ hộ mới hoặc xóa cả hộ gia đình.'
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting family member:', error);
    throw error;
  }
}

/**
 * Update household information
 */
export async function updateHousehold(
  householdId: string,
  updateData: Partial<CreateHouseholdData>
): Promise<Household> {
  try {
    const { data, error } = await supabase
      .from('households')
      .update(updateData)
      .eq('id', householdId)
      .select()
      .single();

    if (error) {
      if (
        error.message?.includes(
          'duplicate key value violates unique constraint'
        )
      ) {
        if (error.message.includes('phone')) {
          throw new Error(
            'Số điện thoại này đã được sử dụng cho hộ gia đình khác'
          );
        }
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating household:', error);
    throw error;
  }
}

/**
 * Update family member information
 */
export async function updateFamilyMember(
  memberId: string,
  updateData: Partial<CreateMemberData>
): Promise<FamilyMember> {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating family member:', error);
    const err = error as Error;
    throw new Error(
      err.message || 'Có lỗi xảy ra khi cập nhật thông tin thành viên'
    );
  }
}

/**
 * Validate phone number uniqueness
 */
export async function validatePhoneUnique(
  phone: string,
  excludeHouseholdId?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('households')
      .select('id')
      .eq('phone', phone.trim());

    if (excludeHouseholdId) {
      query = query.neq('id', excludeHouseholdId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.length === 0; // true if phone is unique
  } catch (error) {
    console.error('Error validating phone:', error);
    return false;
  }
}

/**
 * Get household with all members and computed display name
 */
export async function getHouseholdWithMembers(
  householdId: string
): Promise<Household> {
  try {
    const { data, error } = await supabase
      .from('households')
      .select(
        `
        *,
        head_of_household:family_members!households_head_of_household_id_fkey(*),
        family_members(*)
      `
      )
      .eq('id', householdId)
      .single();

    if (error) throw error;

    // Compute display name
    const displayName = data.head_of_household?.full_name
      ? `Gia đình ${data.head_of_household.full_name}`
      : `Hộ gia đình (${data.id.slice(0, 8)})`;

    return {
      ...data,
      display_name: displayName,
      member_count: data.family_members?.length || 0
    };
  } catch (error) {
    console.error('Error fetching household:', error);
    throw new Error('Không thể tải thông tin hộ gia đình');
  }
}

/**
 * Get all households for a user with computed display names
 */
export async function getUserHouseholds(userId: string): Promise<Household[]> {
  try {
    const { data, error } = await supabase
      .from('households')
      .select(
        `
        *,
        head_of_household:family_members!households_head_of_household_id_fkey(*),
        family_members(count)
      `
      )
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Compute display names and member counts
    return data.map((household) => ({
      ...household,
      display_name: household.head_of_household?.full_name
        ? `Gia đình ${household.head_of_household.full_name}`
        : `Hộ gia đình (${household.id.slice(0, 8)})`,
      member_count: household.family_members?.[0]?.count || 0
    }));
  } catch (error) {
    console.error('Error fetching user households:', error);
    throw new Error('Không thể tải danh sách hộ gia đình');
  }
}
