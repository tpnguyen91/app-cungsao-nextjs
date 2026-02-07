// Fixed version of household operations to avoid join issues
// File: src/lib/household-operations-fixed.ts

import { createClient } from '@/lib/supabase/client';
import type {
  CreateHeadOfHouseholdData,
  CreateHouseholdData,
  CreateHouseholdResponse,
  Household
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
    // Use stored procedure
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
        relationship_role: null,
        is_head_of_household: true,
        is_alive: true,
        notes: headData.notes || null
      }
    });

    if (error) throw error;

    // Fetch the created household and head separately
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', data.household_id)
      .single();

    if (householdError) throw householdError;

    const { data: headMember, error: headError } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', data.head_id)
      .single();

    if (headError) throw headError;

    // Add computed display name
    const householdWithDisplayName = {
      ...household,
      display_name: `Gia đình ${headMember.full_name}`,
      member_count: 1
    };

    return {
      household: householdWithDisplayName,
      head_member: headMember,
      success: true,
      message: 'Tạo hộ gia đình thành công!'
    };
  } catch (error) {
    console.error('Error creating household with head:', error);

    const err = error as Error;
    // Handle specific error cases
    if (
      err.message?.includes('duplicate key value violates unique constraint')
    ) {
      if (err.message.includes('phone')) {
        throw new Error(
          'Số điện thoại này đã được sử dụng cho hộ gia đình khác'
        );
      }
    }

    throw new Error(err.message || 'Có lỗi xảy ra khi tạo hộ gia đình');
  }
}

/**
 * Get household with all members (using separate queries)
 */
export async function getHouseholdWithMembers(
  householdId: string
): Promise<Household> {
  try {
    // Get household first
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', householdId)
      .single();

    if (householdError) throw householdError;

    // Get head of household separately
    let headMember = null;
    if (household.head_of_household_id) {
      const { data: head, error: headError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', household.head_of_household_id)
        .single();

      if (!headError) {
        headMember = head;
      }
    }

    // Get all family members
    const { data: allMembers, error: membersError } = await supabase
      .from('family_members')
      .select('*')
      .eq('household_id', householdId)
      .order('is_head_of_household', { ascending: false })
      .order('created_at', { ascending: true });

    if (membersError) throw membersError;

    // Compute display name
    const displayName = headMember?.full_name
      ? `Gia đình ${headMember.full_name}`
      : `Hộ gia đình (${household.id.slice(0, 8)})`;

    return {
      ...household,
      head_of_household: headMember,
      family_members: allMembers || [],
      display_name: displayName,
      member_count: allMembers?.length || 0
    };
  } catch (error) {
    console.error('Error fetching household:', error);
    throw new Error('Không thể tải thông tin hộ gia đình');
  }
}

/**
 * Get all households for a user (using separate queries)
 */
export async function getUserHouseholds(userId: string): Promise<Household[]> {
  try {
    // Get all households for user
    const { data: households, error: householdsError } = await supabase
      .from('households')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (householdsError) throw householdsError;

    // For each household, get head info and member count
    const householdsWithData = await Promise.all(
      households.map(async (household) => {
        // Get head of household
        let headMember = null;
        if (household.head_of_household_id) {
          const { data: head } = await supabase
            .from('family_members')
            .select('*')
            .eq('id', household.head_of_household_id)
            .single();
          headMember = head;
        }

        // Get member count
        const { count } = await supabase
          .from('family_members')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', household.id);

        // Compute display name
        const displayName = headMember?.full_name
          ? `Gia đình ${headMember.full_name}`
          : `Hộ gia đình (${household.id.slice(0, 8)})`;

        return {
          ...household,
          head_of_household: headMember,
          display_name: displayName,
          member_count: count || 0
        };
      })
    );

    return householdsWithData;
  } catch (error) {
    console.error('Error fetching user households:', error);
    throw new Error('Không thể tải danh sách hộ gia đình');
  }
}
