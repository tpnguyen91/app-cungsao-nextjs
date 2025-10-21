import { z } from 'zod';

// Define relationship enum
export enum RelationshipRole {
  CHU_HO = 'chu_ho',
  VO = 'vo',
  CHONG = 'chong',
  CON = 'con',
  CHA = 'cha',
  ME = 'me',
  CON_DAU = 'con_dau',
  CON_RE = 'con_re',
  CHAU_NOI = 'chau_noi',
  CHAU_NGOAI = 'chau_ngoai'
}

// Define gender enum
export enum Gender {
  NAM = 'nam',
  NU = 'nu'
}

// Display labels for UI
export const RELATIONSHIP_LABELS: Record<RelationshipRole, string> = {
  [RelationshipRole.CHU_HO]: 'Chủ hộ',
  [RelationshipRole.VO]: 'Vợ',
  [RelationshipRole.CHONG]: 'Chồng',
  [RelationshipRole.CON]: 'Con',
  [RelationshipRole.CHA]: 'Cha',
  [RelationshipRole.ME]: 'Mẹ',
  [RelationshipRole.CON_DAU]: 'Con dâu',
  [RelationshipRole.CON_RE]: 'Con rể',
  [RelationshipRole.CHAU_NOI]: 'Cháu nội',
  [RelationshipRole.CHAU_NGOAI]: 'Cháu ngoại'
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.NAM]: 'Nam',
  [Gender.NU]: 'Nữ'
};

// Get arrays for select options
export const RELATIONSHIP_OPTIONS = Object.values(RelationshipRole);
export const GENDER_OPTIONS = Object.values(Gender);

export const familyMemberSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(255, 'Họ tên không được quá 255 ký tự'),
  dharma_name: z.string().optional(),
  birth_year: z
    .number()
    .min(1900, 'Năm sinh không hợp lệ')
    .max(new Date().getFullYear(), 'Năm sinh không được lớn hơn năm hiện tại'),
  // hometown: z.string().max(255, 'Quê quán không được quá 255 ký tự').optional(),
  // relationship_role: z.nativeEnum(RelationshipRole, {
  //   required_error: 'Vui lòng chọn mối quan hệ'
  // }),
  gender: z.nativeEnum(Gender, {
    required_error: 'Vui lòng chọn giới tính'
  }),
  is_head_of_household: z.boolean().default(false),
  is_alive: z.boolean().default(true)
  // notes: z.string().max(1000, 'Ghi chú không được quá 1000 ký tự').optional(),
  // Add location fields
  // province_id: z.string().optional(),
  // ward_id: z.string().optional()
});

export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

// Helper functions
export const getRelationshipLabel = (role: RelationshipRole): string => {
  return RELATIONSHIP_LABELS[role] || role;
};

export const getGenderLabel = (gender: Gender): string => {
  return GENDER_LABELS[gender] || gender;
};

export const getRelationshipColor = (role: RelationshipRole): string => {
  switch (role) {
    case RelationshipRole.CHU_HO:
      return 'bg-blue-100 text-blue-800';
    case RelationshipRole.VO:
    case RelationshipRole.CHONG:
      return 'bg-green-100 text-green-800';
    case RelationshipRole.CON:
      return 'bg-yellow-100 text-yellow-800';
    case RelationshipRole.CHA:
    case RelationshipRole.ME:
      return 'bg-purple-100 text-purple-800';
    case RelationshipRole.CON_DAU:
    case RelationshipRole.CON_RE:
      return 'bg-pink-100 text-pink-800';
    case RelationshipRole.CHAU_NOI:
    case RelationshipRole.CHAU_NGOAI:
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Legacy exports for backward compatibility (DEPRECATED)
export const RELATIONSHIP_ROLES = RELATIONSHIP_OPTIONS;
export { GENDER_OPTIONS as GENDER_OPTIONS_LEGACY };
