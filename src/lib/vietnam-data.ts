import provincesData from '@/data/province.json';
import wardsData from '@/data/ward.json';

// Types
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

// Lazy-loaded and cached data
let _provinces: Province[] | null = null;
let _wardsByProvince: Map<string, Ward[]> | null = null;

const provinces = provincesData as Record<string, Province>;
const wards = wardsData as Record<string, Ward>;

// Memoized helper functions - computed once
export const getProvinces = (): Province[] => {
  if (!_provinces) {
    _provinces = Object.values(provinces).sort((a, b) =>
      a.name.localeCompare(b.name, 'vi')
    );
  }
  return _provinces;
};

export const getWardsByProvince = (provinceCode: string): Ward[] => {
  if (!_wardsByProvince) {
    _wardsByProvince = new Map();
    // Pre-group all wards by province for O(1) lookup
    for (const ward of Object.values(wards)) {
      const existing = _wardsByProvince.get(ward.parent_code) || [];
      existing.push(ward);
      _wardsByProvince.set(ward.parent_code, existing);
    }
    // Sort each group once
    _wardsByProvince.forEach((wardList, code) => {
      _wardsByProvince!.set(
        code,
        wardList.sort((a: Ward, b: Ward) => a.name.localeCompare(b.name, 'vi'))
      );
    });
  }
  return _wardsByProvince.get(provinceCode) || [];
};

export const getProvinceByCode = (code: string): Province | undefined => {
  return provinces[code];
};

export const getWardByCode = (code: string): Ward | undefined => {
  return wards[code];
};
