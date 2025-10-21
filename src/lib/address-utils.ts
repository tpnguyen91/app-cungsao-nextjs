import provinceData from '@/data/province.json';
import wardData from '@/data/ward.json';

export interface Province {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

export interface Ward {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  path_with_type: string;
  code: string;
  path: string;
  parent_code: string;
}
