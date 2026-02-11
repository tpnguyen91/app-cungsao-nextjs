import { z } from 'zod';

export const householdSchema = z.object({
  household_name: z
    .string()
    .min(2, 'Tên hộ gia đình phải có ít nhất 2 ký tự')
    .max(255, 'Tên hộ gia đình không được quá 255 ký tự'),
  address: z
    .string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(500, 'Địa chỉ không được quá 500 ký tự'),
  province_code: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố').optional(),
  ward_code: z.string().min(1, 'Vui lòng chọn phường/xã').optional()
});

export type HouseholdFormData = z.infer<typeof householdSchema>;
