export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          household_name: string;
          address: string;
          province_id: string | null;
          ward_id: string | null;
          head_of_household_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_name: string;
          address: string;
          province_id?: string | null;
          ward_id?: string | null;
          head_of_household_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_name?: string;
          address?: string;
          province_code?: string | null;
          district_code?: string | null;
          ward_code?: string | null;
          head_of_household_id?: string | null;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          household_id: string;
          full_name: string;
          birth_year: number;
          hometown: string | null;
          relationship_role: string;
          is_head_of_household: boolean;
          gender: string | null;
          is_alive: boolean;
          notes: string | null;
          province_code: string | null;
          ward_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          full_name: string;
          birth_year: number;
          hometown?: string | null;
          relationship_role: string;
          is_head_of_household?: boolean;
          gender?: string | null;
          is_alive?: boolean;
          notes?: string | null;
          province_code?: string | null;
          ward_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          full_name?: string;
          birth_year?: number;
          hometown?: string | null;
          relationship_role?: string;
          is_head_of_household?: boolean;
          gender?: string | null;
          is_alive?: boolean;
          notes?: string | null;
          province_code?: string | null;
          ward_code?: string | null;
          updated_at?: string;
        };
      };
      worship_history: {
        Row: {
          id: string;
          household_id: string;
          family_member_id: string | null;
          worship_date: string;
          worship_type: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          family_member_id?: string | null;
          worship_date: string;
          worship_type?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          family_member_id?: string | null;
          worship_date?: string;
          worship_type?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}

export type Household = Database['public']['Tables']['households']['Row'];
export type FamilyMember =
  Database['public']['Tables']['family_members']['Row'];
export type WorshipHistory =
  Database['public']['Tables']['worship_history']['Row'];
