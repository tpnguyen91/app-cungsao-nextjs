import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

export function getCanChi(year: number): string {
  const thienCan = [
    'Canh',
    'Tân',
    'Nhâm',
    'Quý',
    'Giáp',
    'Ất',
    'Bính',
    'Đinh',
    'Mậu',
    'Kỷ'
  ];

  const diaChi = [
    'Thân',
    'Dậu',
    'Tuất',
    'Hợi',
    'Tý',
    'Sửu',
    'Dần',
    'Mão',
    'Thìn',
    'Tỵ',
    'Ngọ',
    'Mùi'
  ];

  const can = thienCan[year % 10];
  const chi = diaChi[year % 12];

  return `${can} ${chi}`;
}

export function getSaoChieuMenh(birthYear: number, gender: string): string {
  // Bảng sao cho nam và nữ theo chu kỳ 9 năm
  const saoNam = [
    'La Hầu', // dư 1
    'Thổ Tú', // dư 2
    'Thủy Diệu', // dư 3
    'Thái Bạch', // dư 4
    'Thái Dương', // dư 5
    'Vân Hán', // dư 6
    'Kế Đô', // dư 7
    'Thái Âm', // dư 8
    'Mộc Đức' // dư 9 hoặc dư 0
  ];

  const saoNu = [
    'Kế Đô', // dư 1
    'Vân Hán', // dư 2
    'Mộc Đức', // dư 3
    'Thái Âm', // dư 4
    'Thổ Tú', // dư 5
    'La Hầu', // dư 6
    'Thái Dương', // dư 7
    'Thái Bạch', // dư 8
    'Thủy Diệu' // dư 9 hoặc dư 0
  ];

  // Lấy năm hiện tại
  const currentYear = new Date().getFullYear();

  // Tính tuổi mụ
  const tuoiMu = currentYear - birthYear + 1;

  // Dư theo chu kỳ 9
  let du = tuoiMu % 9;
  if (du === 0) du = 9;

  // Lấy sao chiếu mệnh
  const result = gender === 'nam' ? saoNam[du - 1] : saoNu[du - 1];
  return result || '';
}

export function getVanHan(birthYear: number, gender: string) {
  // Bảng sao chiếu mệnh
  const saoNam = [
    'La Hầu',
    'Thổ Tú',
    'Thủy Diệu',
    'Thái Bạch',
    'Thái Dương',
    'Vân Hán',
    'Kế Đô',
    'Thái Âm',
    'Mộc Đức'
  ];
  const saoNu = [
    'Kế Đô',
    'Vân Hán',
    'Mộc Đức',
    'Thái Âm',
    'Thổ Tú',
    'La Hầu',
    'Thái Dương',
    'Thái Bạch',
    'Thủy Diệu'
  ];

  // Bảng hạn 8 năm
  const han8Nam = [
    'Huỳnh Tuyền',
    'Tam Kheo',
    'Tam Tai',
    'Thiên Tinh',
    'Toán Tận',
    'Ngũ Mộ',
    'Thiên La',
    'Địa Võng'
  ];

  const currentYear = new Date().getFullYear();
  const tuoiMu = currentYear - birthYear + 1;

  // --- Sao chiếu mệnh ---
  let du9 = tuoiMu % 9;
  if (du9 === 0) du9 = 9;
  const sao = gender === 'nam' ? saoNam[du9 - 1] : saoNu[du9 - 1];

  // --- Hạn 8 năm ---
  let du8 = tuoiMu % 8;
  const han = han8Nam[du8 === 0 ? 7 : du8 - 1];

  // --- Hạn Diêm Vương ---
  const diemVuong = tuoiMu % 8 === 0;

  // --- Hạn Tam Tai ---
  // Xác định con giáp
  const diaChi = [
    'Thân',
    'Dậu',
    'Tuất',
    'Hợi',
    'Tý',
    'Sửu',
    'Dần',
    'Mão',
    'Thìn',
    'Tỵ',
    'Ngọ',
    'Mùi'
  ];
  const chi = diaChi[birthYear % 12];

  // Nhóm Tam Hợp → năm Tam Tai tương ứng
  const tamHop: Record<string, string[]> = {
    Thân: ['Dần', 'Mão', 'Thìn'],
    Tý: ['Dần', 'Mão', 'Thìn'],
    Thìn: ['Dần', 'Mão', 'Thìn'],

    Dần: ['Thân', 'Dậu', 'Tuất'],
    Ngọ: ['Thân', 'Dậu', 'Tuất'],
    Tuất: ['Thân', 'Dậu', 'Tuất'],

    Hợi: ['Tỵ', 'Ngọ', 'Mùi'],
    Mão: ['Tỵ', 'Ngọ', 'Mùi'],
    Mùi: ['Tỵ', 'Ngọ', 'Mùi'],

    Tỵ: ['Hợi', 'Tý', 'Sửu'],
    Dậu: ['Hợi', 'Tý', 'Sửu'],
    Sửu: ['Hợi', 'Tý', 'Sửu']
  };

  const currentChi = diaChi[currentYear % 12] || '';
  const tamTai = chi && tamHop[chi] ? tamHop[chi].includes(currentChi) : false;

  return { sao, han, diemVuong, tamTai, tuoiMu, chi };
}

export function getTuoi(birthYear: number): number {
  return new Date().getFullYear() - birthYear + 1;
}

// Dummy data generator function
export function generateDummyHouseholds(count = 100) {
  const familyNames = [
    'Nguyễn',
    'Trần',
    'Lê',
    'Phạm',
    'Hoàng',
    'Huỳnh',
    'Phan',
    'Vũ',
    'Võ',
    'Đặng',
    'Bùi',
    'Đỗ',
    'Hồ',
    'Ngô',
    'Dương',
    'Lý',
    'Mai',
    'Đinh',
    'Lương',
    'Chu'
  ];

  const middleNames = [
    'Văn',
    'Thị',
    'Đình',
    'Minh',
    'Thu',
    'Hữu',
    'Quang',
    'Tấn',
    'Thanh',
    'Hoài',
    'Phương',
    'Xuân',
    'Hùng',
    'Thành',
    'Đức',
    'Anh',
    'Tuấn',
    'Hải',
    'Nam',
    'Long'
  ];

  const givenNames = [
    'An',
    'Bình',
    'Cường',
    'Dũng',
    'Em',
    'Phong',
    'Giang',
    'Hạnh',
    'Inh',
    'Khoa',
    'Lan',
    'Mai',
    'Nam',
    'Oanh',
    'Phúc',
    'Quỳnh',
    'Rồng',
    'Sơn',
    'Thảo',
    'Uyên',
    'Vân',
    'Xuân',
    'Yến',
    'Zung',
    'Linh',
    'Hương',
    'Trang',
    'Hà',
    'Ly',
    'Chi'
  ];

  const streetPrefixes = [
    'Lê Lợi',
    'Nguyễn Huệ',
    'Trần Hưng Đạo',
    'Hai Bà Trưng',
    'Điện Biên Phủ',
    'Lê Duẩn',
    'Võ Văn Kiệt',
    'Cách Mạng Tháng 8',
    'Lý Thường Kiệt',
    'Phan Chu Trinh',
    'Nguyễn Thị Minh Khai',
    'Lê Văn Việt',
    'Tô Hiến Thành',
    'Phạm Ngọc Thạch',
    'Hoàng Diệu',
    'Lê Công Phép',
    'Nguyễn Văn Cừ',
    'Trương Định',
    'Võ Thị Sáu',
    'Bạch Đằng'
  ];

  const districts = [
    'Quận 1',
    'Quận 2',
    'Quận 3',
    'Quận 4',
    'Quận 5',
    'Quận 6',
    'Quận 7',
    'Quận 8',
    'Quận 9',
    'Quận 10',
    'Quận 11',
    'Quận 12',
    'Bình Thạnh',
    'Phú Nhuận',
    'Tân Bình',
    'Tân Phú',
    'Gò Vấp',
    'Bình Tân',
    'Thủ Đức',
    'Hóc Môn'
  ];

  const wards = [
    'P. An Lạc',
    'P. Tân Sơn Nhì',
    'P. Tây Thạnh',
    'P. Bình Trị Đông',
    'P. Bình Hưng Hòa',
    'P. An Lạc A',
    'P. Tân Tạo',
    'P. Bình Hưng Hòa A',
    'P. Bình Hưng Hòa B',
    'P. Tân Tạo A',
    'P. An Phú',
    'P. Thảo Điền',
    'P. Bình An',
    'P. Cát Lái',
    'P. Thạnh Mỹ Lợi',
    'P. Bến Nghé',
    'P. Cô Giang',
    'P. Nguyễn Thái Bình',
    'P. Phạm Ngũ Lão',
    'P. Cầu Ông Lãnh'
  ];

  const provinceCodes = [
    '01',
    '79',
    '17',
    '20',
    '36',
    '48',
    '52',
    '64',
    '68',
    '77'
  ];
  const wardCodes = Array.from({ length: 50 }, (_, i) => String(11500 + i));
  const phoneOperators = [
    '090',
    '091',
    '092',
    '093',
    '094',
    '096',
    '097',
    '098',
    '099'
  ];

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)] as T;
  }

  function generateName() {
    const family = getRandomElement(familyNames);
    const middle = getRandomElement(middleNames);
    const given = getRandomElement(givenNames);
    return `${family} ${middle} ${given}`;
  }

  function generateAddress() {
    const number = Math.floor(Math.random() * 999) + 1;
    const subNumber = Math.floor(Math.random() * 99) + 1;
    const street = getRandomElement(streetPrefixes);
    const ward = getRandomElement(wards);
    const district = getRandomElement(districts);

    return `${number}/${subNumber} ${street}, ${ward}, ${district}`;
  }

  function generatePhone() {
    const operator = getRandomElement(phoneOperators);
    const number = Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, '0');
    return operator + number;
  }

  function generateRandomDate(start: Date, end: Date): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  }

  const households = [];
  const startDate = new Date(2023, 0, 1); // 1 Jan 2023
  const endDate = new Date(); // Now

  for (let i = 0; i < count; i++) {
    const createdAt = generateRandomDate(startDate, endDate);
    const memberCount = Math.floor(Math.random() * 8) + 1; // 1-8 members

    const household = {
      id: generateUUID(),
      household_name: `Gia đình ${generateName()}`,
      address: generateAddress(),
      province_id: Math.random() > 0.2 ? getRandomElement(provinceCodes) : null,
      ward_id: Math.random() > 0.2 ? getRandomElement(wardCodes) : null,
      head_of_household_id: generateUUID(),
      created_by: generateUUID(),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      phone: Math.random() > 0.1 ? generatePhone() : null,
      province_code:
        Math.random() > 0.2 ? getRandomElement(provinceCodes) : null,
      ward_code: Math.random() > 0.2 ? getRandomElement(wardCodes) : null,
      notes: Math.random() > 0.7 ? 'Ghi chú cho gia đình' : null,
      member_count: memberCount,
      head_of_household:
        Math.random() > 0.1
          ? {
              id: generateUUID(),
              full_name: generateName()
            }
          : null
    };

    households.push(household);
  }

  return households;
}
