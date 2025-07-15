import provincesData from '@/data/province.json';
import wardsData from '@/data/ward.json';

// Define types for the data structure
export interface Province {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

export interface Ward {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

export interface VietnamData {
  provinces: Record<string, Province>;
  wards: Record<string, Ward>;
}

export const vietnamData: VietnamData = {
  provinces: provincesData as Record<string, Province>,
  wards: wardsData as Record<string, Ward>
};

// Helper functions
export const getProvinces = () => {
  return Object.values(vietnamData.provinces).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

export const getWardsByProvince = (provinceCode: string) => {
  return Object.values(vietnamData.wards)
    .filter((ward) => ward.parent_code === provinceCode)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getProvinceByCode = (code: string) => {
  return vietnamData.provinces[code];
};

export const getWardByCode = (code: string) => {
  return vietnamData.wards[code];
};
