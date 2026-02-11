'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  searchFamilyMembers,
  type MemberSearchResult
} from '@/features/family-members/actions/family-member-actions';
import { useDebounce } from '@/hooks/use-debounce';
import provinceData from '@/data/province.json';
import wardData from '@/data/ward.json';
import { Home, MapPin, Search, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface MemberSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember?: (member: MemberSearchResult) => void;
}

function MemberSearchModalContent({
  isOpen,
  onClose,
  onSelectMember
}: MemberSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchFamilyMembers(debouncedSearch);
        setResults(searchResults);
      } catch (error) {
        console.error('Error searching members:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const getProvinceName = (code: string | null) => {
    if (!code) return '';
    const province = provinceData[code as keyof typeof provinceData];
    return province?.name || '';
  };

  const getWardName = (code: string | null) => {
    if (!code) return '';
    const ward = wardData[code as keyof typeof wardData];
    return ward?.name_with_type || '';
  };

  const formatAddress = (
    address: string | null,
    provinceCode: string | null,
    wardCode: string | null
  ) => {
    const parts = [];
    if (address) parts.push(address);
    const ward = getWardName(wardCode);
    if (ward) parts.push(ward);
    const province = getProvinceName(provinceCode);
    if (province) parts.push(province);
    return parts.join(', ') || 'Chưa có thông tin';
  };

  const calculateAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear;
  };

  const handleSelectMember = (member: MemberSearchResult) => {
    if (onSelectMember) {
      onSelectMember(member);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex h-[66.67vh] w-[680px] max-w-[95vw] flex-col p-0 sm:max-w-[680px]'>
        <div className='flex h-full flex-col'>
          <DialogHeader className='shrink-0 border-b px-6 pt-6 pb-4'>
            <DialogTitle className='flex items-center gap-2 text-xl'>
              <Search className='h-5 w-5 text-blue-600' />
              Tìm kiếm thành viên
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className='shrink-0 px-6 pt-4 pb-3'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                type='text'
                placeholder='Nhập tên thành viên cần tìm (tối thiểu 2 ký tự)...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-11 border-slate-300 pl-10 text-base focus-visible:ring-blue-500'
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className='flex-1 overflow-y-auto px-6'>
            {/* Search Status */}
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
              <p className='mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600'>
                Vui lòng nhập ít nhất 2 ký tự để tìm kiếm
              </p>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className='flex items-center justify-center py-12'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600' />
                  <p className='text-sm text-slate-600'>Đang tìm kiếm...</p>
                </div>
              </div>
            )}

            {/* Results Table */}
            {!isSearching && debouncedSearch.trim().length >= 2 && (
              <div className='rounded-lg border'>
                {results.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <User className='mb-3 h-12 w-12 text-slate-300' />
                    <p className='font-medium text-slate-600'>
                      Không tìm thấy thành viên
                    </p>
                    <p className='mt-1 text-sm text-slate-500'>
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-slate-50'>
                        <TableHead className='font-semibold text-slate-700'>
                          Thông tin thành viên
                        </TableHead>
                        <TableHead className='font-semibold text-slate-700'>
                          Hộ gia đình
                        </TableHead>
                        <TableHead className='font-semibold text-slate-700'>
                          Quê quán
                        </TableHead>
                        <TableHead className='w-32 font-semibold text-slate-700'>
                          Thao tác
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((member) => (
                        <TableRow
                          key={member.id}
                          className='cursor-pointer transition-colors hover:bg-blue-50'
                          onClick={() => handleSelectMember(member)}
                        >
                          <TableCell>
                            <div className='flex flex-col gap-1'>
                              <div className='flex items-center gap-2'>
                                <User className='h-4 w-4 flex-shrink-0 text-blue-600' />
                                <span className='font-medium text-slate-900'>
                                  {member.full_name}
                                </span>
                                {member.is_head_of_household && (
                                  <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700'>
                                    Chủ hộ
                                  </span>
                                )}
                              </div>
                              <div className='ml-6 text-sm text-slate-600'>
                                {calculateAge(member.birth_year)} tuổi (
                                {member.birth_year})
                                {member.gender && (
                                  <span className='ml-2'>
                                    • {member.gender}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-start gap-2'>
                              <Home className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600' />
                              <div className='flex flex-col gap-0.5'>
                                <span className='text-sm text-slate-700'>
                                  {formatAddress(
                                    member.household_address,
                                    member.household_province_code,
                                    member.household_ward_code
                                  )}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-start gap-2'>
                              <MapPin className='mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600' />
                              <span className='text-sm text-slate-700'>
                                {formatAddress(
                                  member.hometown_address,
                                  member.hometown_province_code,
                                  member.hometown_ward_code
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/gia-dinh/${member.household_id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant='outline'
                                size='sm'
                                className='w-full border-blue-200 text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800'
                              >
                                <Users className='mr-1.5 h-3.5 w-3.5' />
                                Xem hộ
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </div>

          {/* Results Summary Footer */}
          {!isSearching &&
            debouncedSearch.trim().length >= 2 &&
            results.length > 0 && (
              <div className='flex shrink-0 items-center justify-between border-t bg-slate-50 px-6 py-3'>
                <p className='text-sm text-slate-600'>
                  Tìm thấy{' '}
                  <span className='font-semibold'>{results.length}</span> kết
                  quả
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onClose}
                  className='text-slate-600 hover:bg-white'
                >
                  Đóng
                </Button>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MemberSearchModal(props: MemberSearchModalProps) {
  return <MemberSearchModalContent {...props} />;
}
