# Modal Tìm Kiếm Thành Viên

Component modal chuyên nghiệp để tìm kiếm thành viên gia đình theo tên.

## ✨ Tính năng

- **Tìm kiếm realtime** với debounce 500ms
- **Hiển thị đầy đủ thông tin**:
  - Tên thành viên, tuổi, giới tính
  - Hộ gia đình đang thuộc về
  - Địa chỉ quê quán
  - Badge "Chủ hộ" cho người đứng đầu
- **Xem chi tiết**: Link trực tiếp đến trang hộ gia đình
- **UX chuyên nghiệp**:
  - Loading state với spinner
  - Empty state khi không có kết quả
  - Validation tối thiểu 2 ký tự
  - Hover effect trên rows
  - Auto-focus vào search input

## 🚀 Cách sử dụng

### 1. Import component

```tsx
import { MemberSearchModal } from '@/components/family-members/member-search-modal';
```

### 2. Sử dụng trong component của bạn

```tsx
'use client';

import { MemberSearchModal } from '@/components/family-members/member-search-modal';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function YourComponent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div>
      {/* Nút mở modal */}
      <Button onClick={() => setIsSearchOpen(true)}>
        <Search className="h-4 w-4 mr-2" />
        Tìm kiếm thành viên
      </Button>

      {/* Modal search */}
      <MemberSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMember={(member) => {
          console.log('Selected member:', member);
          // Xử lý khi chọn thành viên
        }}
      />
    </div>
  );
}
```

### 3. Sử dụng với keyboard shortcut (Optional)

```tsx
'use client';

import { MemberSearchModal } from '@/components/family-members/member-search-modal';
import { useEffect, useState } from 'react';

export function YourComponent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Mở modal với Cmd+K hoặc Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <MemberSearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
    />
  );
}
```

## 📋 Props

| Prop | Type | Required | Mô tả |
|------|------|----------|-------|
| `isOpen` | `boolean` | ✅ | Trạng thái hiển thị modal |
| `onClose` | `() => void` | ✅ | Callback khi đóng modal |
| `onSelectMember` | `(member: MemberSearchResult) => void` | ❌ | Callback khi chọn thành viên |

## 📦 Interface MemberSearchResult

```typescript
interface MemberSearchResult {
  id: string;
  full_name: string;
  birth_year: number;
  household_id: string;
  household_address: string | null;
  household_province_code: string | null;
  household_ward_code: string | null;
  hometown_address: string | null;
  hometown_province_code: string | null;
  hometown_ward_code: string | null;
  is_head_of_household: boolean;
  relationship_role: string;
  gender: string | null;
}
```

## 🎨 Thiết kế UI

Modal được thiết kế theo các nguyên tắc UI/UX chuyên nghiệp:

### Icons & Colors
- ✅ **Không dùng emoji icons** - Sử dụng Lucide icons
- ✅ **Icons có màu semantic**:
  - 🔵 Blue - Thông tin thành viên
  - 🟢 Green - Địa chỉ hộ gia đình
  - 🟠 Orange - Quê quán
  - 🟡 Amber - Badge chủ hộ

### Interaction
- ✅ **Cursor pointer** trên hover table rows
- ✅ **Smooth transitions** (200ms) cho hover states
- ✅ **Auto-focus** vào search input khi mở modal
- ✅ **Click row** để chọn thành viên
- ✅ **Debounce search** 500ms để giảm API calls

### Accessibility
- ✅ **Keyboard navigation** (Tab, Enter, Escape)
- ✅ **ARIA labels** cho screen readers
- ✅ **Focus management** khi mở/đóng modal
- ✅ **Visual feedback** cho mọi action

### Responsive
- ✅ **Max-width**: 5xl (1024px)
- ✅ **Max-height**: 90vh với scroll
- ✅ **Mobile-friendly** table layout

## 🔧 Technical Implementation

### Server Action
File: `src/features/family-members/actions/family-member-actions.ts`

```typescript
export async function searchFamilyMembers(searchQuery: string)
```

- Join `family_members` với `households`
- Search case-insensitive với `ilike`
- Limit 50 kết quả
- Transform nested data structure

### Debounce Hook
Sử dụng hook `useDebounce` để delay search 500ms, tránh gọi API quá nhiều.

### Data Formatting
- **Địa chỉ**: Kết hợp address + ward + province
- **Tuổi**: Tự động tính từ birth_year
- **Province/Ward names**: Load từ JSON data

## 🎯 Use Cases

1. **Tìm kiếm nhanh thành viên** trong database lớn
2. **Link thành viên vào form** (ví dụ: thêm vào danh sách)
3. **Navigate đến hộ gia đình** của thành viên
4. **Kiểm tra thông tin** trước khi thao tác

## 🚨 Lưu ý

- Cần nhập **tối thiểu 2 ký tự** để tìm kiếm
- Search chỉ tìm theo **tên thành viên** (full_name)
- Kết quả giới hạn **50 records** đầu tiên
- Modal **auto-reset** khi đóng

## 📸 Preview

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Tìm kiếm thành viên                                     [X]  │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 Nhập tên thành viên cần tìm...                              │
├─────────────────────────────────────────────────────────────────┤
│ Thông tin thành viên | Hộ gia đình      | Quê quán    | Thao tác│
├─────────────────────────────────────────────────────────────────┤
│ 👤 Nguyễn Văn A      │ 🏠 123 Trần Phú  │ 📍 Hà Nội  │ [Xem hộ]│
│    35 tuổi (1989)    │    P.1, Q.1      │            │         │
│    • Nam  [Chủ hộ]   │    TP.HCM        │            │         │
├─────────────────────────────────────────────────────────────────┤
│ 👤 Nguyễn Thị B      │ 🏠 456 Lê Lợi    │ 📍 Đà Nẵng │ [Xem hộ]│
│    28 tuổi (1996)    │    P.2, Q.2      │            │         │
│    • Nữ              │    TP.HCM        │            │         │
└─────────────────────────────────────────────────────────────────┘
   Tìm thấy 2 kết quả                                      [Đóng]
```

## 🔗 Related Files

- Component: `src/components/family-members/member-search-modal.tsx`
- Action: `src/features/family-members/actions/family-member-actions.ts`
- Hook: `src/hooks/use-debounce.tsx`
- Types: Interface `MemberSearchResult`

---

**Tác giả**: AI Assistant  
**Ngày tạo**: 2026-02-10  
**Version**: 1.0.0
