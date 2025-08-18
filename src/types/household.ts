// Updated types for new household schema
// File: src/types/household.ts

export interface HouseholdAddress {
  address: string;
  province_code: string;
  ward_code: string;
}

export interface MemberAddress extends HouseholdAddress {
  // Same structure as household address for member's hometown
}

export interface Household {
  id: string;
  address: string;
  province_code: string;
  ward_code: string;
  phone: string; // Now required and unique
  notes?: string;
  head_of_household_id: string; // Now required
  created_by: string;
  created_at: string;
  updated_at: string;

  // Relationships
  head_of_household?: FamilyMember;
  family_members?: FamilyMember[];

  // Computed fields
  display_name?: string; // "Gia đình {head_name}"
  member_count?: number;
}

export interface FamilyMember {
  id: string;
  household_id: string;
  full_name: string;
  birth_year: number;
  relationship_role: RelationshipRole;
  gender: Gender;
  is_head_of_household: boolean;
  is_alive: boolean;
  notes?: string;

  // New hometown fields (structured address)
  hometown_address?: string;
  hometown_province_code?: string;
  hometown_ward_code?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Computed fields
  age?: number;
  hometown_display?: string; // Full formatted address
}

// Form data types for create/update operations
export interface CreateHouseholdData {
  // Step 1: Household info
  address: string;
  province_code: string;
  ward_code: string;
  phone: string;
  notes?: string;
}

export interface CreateHeadOfHouseholdData {
  // Step 2: Head of household info
  full_name: string;
  birth_year: number;
  gender: Gender;
  hometown_address: string;
  hometown_province_code: string;
  hometown_ward_code: string;
  use_same_address: boolean; // UI helper
  notes?: string;
}

export interface CreateMemberData {
  full_name: string;
  birth_year: number;
  relationship_role: RelationshipRole;
  gender: Gender;
  hometown_address: string;
  hometown_province_code: string;
  hometown_ward_code: string;
  use_same_address: boolean; // UI helper
  notes?: string;
}

// Wizard state type
export interface HouseholdWizardState {
  step: 1 | 2 | 3; // Steps: Household Info -> Head Info -> Success
  householdData: Partial<CreateHouseholdData>;
  headData: Partial<CreateHeadOfHouseholdData>;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Business logic types
export interface TransferHeadshipData {
  household_id: string;
  new_head_id: string;
  current_head_id: string;
}

export interface DeleteHouseholdData {
  household_id: string;
  household_name: string;
  member_count: number;
  confirm: boolean;
}

// Display/UI helper types
export interface HouseholdDisplayInfo {
  id: string;
  display_name: string;
  address_short: string;
  head_name: string;
  member_count: number;
  phone: string;
  created_date: string;
}

export interface MemberDisplayInfo {
  id: string;
  full_name: string;
  age: number;
  relationship_label: string;
  gender_label: string;
  hometown_display: string;
  is_head: boolean;
}

// Filter/Search types
export interface HouseholdFilters {
  search_text: string; // Name, head name, phone
  province_filter: string;
  ward_filter: string;
}

export interface MemberFilters {
  search_text: string; // Name, hometown
  relationship_filter: RelationshipRole | '';
  age_min: number | null;
  age_max: number | null;
  hometown_province_filter: string;
}

// Validation schemas (for zod)
export interface HouseholdValidationSchema {
  address: string;
  province_code: string;
  ward_code: string;
  phone: string;
}

export interface MemberValidationSchema {
  full_name: string;
  birth_year: number;
  relationship_role: RelationshipRole;
  gender: Gender;
  hometown_address: string;
  hometown_province_code: string;
  hometown_ward_code: string;
}

// API response types
export interface CreateHouseholdResponse {
  household: Household;
  head_member: FamilyMember;
  success: boolean;
  message: string;
}

export interface UpdateHouseholdResponse {
  household: Household;
  success: boolean;
  message: string;
}

export interface TransferHeadshipResponse {
  household: Household;
  old_head: FamilyMember;
  new_head: FamilyMember;
  success: boolean;
  message: string;
}

// Enums (assuming these exist in your current schema)
export enum RelationshipRole {
  CHU_HO = 'CHU_HO',
  VO_CHONG = 'VO_CHONG',
  CON = 'CON',
  CHA_ME = 'CHA_ME',
  ANH_CHI_EM = 'ANH_CHI_EM',
  KHAC = 'KHAC'
}

export enum Gender {
  NAM = 'NAM',
  NU = 'NU'
}

// Helper type for form state management
export type WizardStepData =
  | { step: 1; data: Partial<CreateHouseholdData> }
  | { step: 2; data: Partial<CreateHeadOfHouseholdData> }
  | { step: 3; data: { household: Household; head: FamilyMember } };
