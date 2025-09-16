// Updated HouseholdsTable component - removes filteredData useMemo và sử dụng URL params
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { URL_GIA_DINH_DETAIL } from '@/constants/url';
import { useHouseholdNavigation } from '@/hooks/use-household-navigation';
import { getProvinces, getWardsByProvince } from '@/lib/vietnam-data';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Eye,
  Home,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { DeleteHouseholdDialog } from './delete-household-dialog';
import { EditHouseholdDialog } from './edit-household-dialog';

export interface Household {
  id: string;
  household_name: string;
  address: string;
  province_id?: string;
  ward_id?: string;
  phone?: string;
  created_at: string;
  head_of_household?: {
    id: string;
    full_name: string;
  };
  member_count?: number;
}

interface HouseholdsTableProps {
  households: Household[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchText: string;
  provinceFilter: string;
  wardFilter: string;
}

export function HouseholdsTable({
  households,
  totalCount,
  currentPage,
  pageSize,
  searchText: initialSearchText,
  provinceFilter: initialProvinceFilter,
  wardFilter: initialWardFilter
}: HouseholdsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Local state for immediate UI feedback
  const [searchText, setSearchText] = React.useState(initialSearchText);
  const [provinceFilter, setProvinceFilter] = React.useState(
    initialProvinceFilter
  );
  const [wardFilter, setWardFilter] = React.useState(initialWardFilter);

  const { openHouseholdDrawer } = useHouseholdNavigation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update local state when props change (e.g., when page loads with existing filters)
  React.useEffect(() => {
    setSearchText(initialSearchText);
    setProvinceFilter(initialProvinceFilter);
    setWardFilter(initialWardFilter);
  }, [initialSearchText, initialProvinceFilter, initialWardFilter]);

  // Debounced URL update function
  const debouncedUpdateURL = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (params: URLSearchParams) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        router.push(`?${params.toString()}`);
      }, 500); // 500ms debounce
    };
  }, [router]);

  // Helper function to update URL parameters
  const updateURLParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except when specifically updating page)
    if (!updates.page) {
      params.delete('page');
    }

    debouncedUpdateURL(params);
  };

  // Handle search text change
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    updateURLParams({ search: value });
  };

  // Handle province filter change
  const handleProvinceChange = (value: string) => {
    setProvinceFilter(value);
    setWardFilter(''); // Reset ward when province changes
    updateURLParams({
      province: value,
      ward: '' // Clear ward when province changes
    });
  };

  // Handle ward filter change
  const handleWardChange = (value: string) => {
    setWardFilter(value);
    updateURLParams({ ward: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setProvinceFilter('');
    setWardFilter('');
    router.push(window.location.pathname); // Clear all search params
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    router.push(`?${params.toString()}`);
  };

  const getMemberCount = (household: Household) => {
    return household?.member_count || 0;
  };

  const provinces = getProvinces();
  const wards = provinceFilter ? getWardsByProvince(provinceFilter) : [];

  // Check if any filters are active
  const hasActiveFilters = searchText || provinceFilter || wardFilter;

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  const columns: ColumnDef<Household>[] = [
    {
      accessorKey: 'household_name',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2 font-semibold hover:bg-pink-50 hover:text-pink-700'
          >
            <Home className='mr-2 h-4 w-4' />
            Tên hộ gia đình
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-semibold text-gray-900 transition-colors group-hover:text-pink-700'>
            {row.getValue('household_name')}
          </div>
          {row.original.head_of_household && (
            <div className='text-muted-foreground flex items-center text-xs'>
              <Users className='mr-1 h-3 w-3' />
              Chủ hộ: {row.original.head_of_household.full_name}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'address',
      header: () => (
        <div className='flex items-center font-semibold'>
          <MapPin className='mr-2 h-4 w-4' />
          Thông tin
        </div>
      ),
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div
            className='max-w-xs truncate text-sm text-gray-900'
            title={row.getValue('address')}
          >
            {row.getValue('address')}
          </div>
          {row.original.phone && (
            <div className='text-muted-foreground flex items-center text-xs'>
              <Phone className='mr-1 h-3 w-3' />
              {row.original.phone}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'member_count',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2 font-semibold'
          >
            <Users className='mr-2 h-4 w-4' />
            Thành viên
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = getMemberCount(row.original);
        return (
          <div className='flex items-center space-x-2'>
            <Badge
              variant={count > 0 ? 'default' : 'secondary'}
              className={`px-3 py-1 font-mono text-xs ${
                count > 0
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Users className='mr-1 h-3 w-3' />
              {count} {count === 1 ? 'người' : 'người'}
            </Badge>
            {count > 5 && (
              <Badge
                variant='secondary'
                className='bg-blue-100 px-2 py-1 text-xs text-blue-800'
              >
                Đông
              </Badge>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const countA = getMemberCount(rowA.original);
        const countB = getMemberCount(rowB.original);
        return countA - countB;
      }
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2 font-semibold'
          >
            <Calendar className='mr-2 h-4 w-4' />
            Ngày tạo
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

        return (
          <div className='space-y-1'>
            <div className='text-sm font-medium text-gray-900'>
              {format(date, 'dd/MM/yyyy', { locale: vi })}
            </div>
            <div className='text-muted-foreground flex items-center text-xs'>
              <Calendar className='mr-1 h-3 w-3' />
              {format(date, 'HH:mm', { locale: vi })}
              {isRecent && (
                <Badge
                  variant='secondary'
                  className='ml-2 bg-green-100 px-2 py-0 text-xs text-green-800'
                >
                  Mới
                </Badge>
              )}
            </div>
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: () => <div className='text-center font-semibold'>Thao tác</div>,
      cell: ({ row }) => {
        const household = row.original;

        return (
          <div className='flex items-center justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-pink-50'
                >
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='text-sm font-semibold text-gray-900'>
                  Thao tác cho "{household.household_name}"
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openHouseholdDrawer(household.id)}
                  className='flex cursor-pointer items-center hover:bg-pink-50 hover:text-pink-700'
                >
                  <Users className='mr-2 h-4 w-4' />
                  <div>
                    <div className='font-medium'>Xem thành viên</div>
                    <div className='text-muted-foreground text-xs'>
                      Quản lý {getMemberCount(household)} thành viên
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={URL_GIA_DINH_DETAIL(household.id)}
                    className='flex items-center hover:bg-blue-50 hover:text-blue-700'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    <div>
                      <div className='font-medium'>Xem chi tiết</div>
                      <div className='text-muted-foreground text-xs'>
                        Thông tin đầy đủ
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <EditHouseholdDialog household={household}>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className='hover:bg-amber-50 hover:text-amber-700'
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    <div>
                      <div className='font-medium'>Chỉnh sửa</div>
                      <div className='text-muted-foreground text-xs'>
                        Cập nhật thông tin
                      </div>
                    </div>
                  </DropdownMenuItem>
                </EditHouseholdDialog>
                <DropdownMenuSeparator />
                <DeleteHouseholdDialog
                  householdId={household.id}
                  householdName={household.household_name}
                >
                  <DropdownMenuItem
                    className='text-red-600 hover:bg-red-50 focus:text-red-600'
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    <div>
                      <div className='font-medium'>Xóa</div>
                      <div className='text-xs opacity-75'>
                        Không thể hoàn tác
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DeleteHouseholdDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: households, // Sử dụng data trực tiếp từ server (đã được filter)
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    },
    manualPagination: true, // Quan trọng: báo table rằng pagination được xử lý manually
    manualFiltering: true, // Quan trọng: báo table rằng filtering được xử lý manually
    pageCount: totalPages // Tổng số pages từ server
  });

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <div className='space-y-4'>
        {/* Search and Filters Row */}
        <div className='flex flex-col gap-4 sm:flex-row'>
          {/* Search by Name/Phone */}
          <div className='flex'>
            <div className='relative w-[450px]'>
              <Search className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm kiếm theo tên hộ gia đình, chủ hộ, số điện thoại...'
                value={searchText}
                onChange={(event) => handleSearchChange(event.target.value)}
                className='border-gray-200 pr-10 pl-10 focus:border-pink-300 focus:ring-pink-200'
              />
              {searchText && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute top-1.5 right-1.5 h-6 w-6 p-0 text-gray-400 hover:text-gray-600'
                  onClick={() => handleSearchChange('')}
                >
                  <X className='h-3 w-3' />
                </Button>
              )}
            </div>
          </div>

          {/* Location Filters */}
          <div className='flex gap-3'>
            <Select value={provinceFilter} onValueChange={handleProvinceChange}>
              <SelectTrigger className='w-[250px] border-gray-200 focus:border-pink-300 focus:ring-pink-200'>
                <MapPin className='mr-2 h-4 w-4 text-gray-400' />
                <SelectValue placeholder='Chọn tỉnh/thành phố' />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={wardFilter}
              onValueChange={handleWardChange}
              disabled={!provinceFilter}
            >
              <SelectTrigger className='w-[250px] border-gray-200 focus:border-pink-300 focus:ring-pink-200'>
                <MapPin className='mr-2 h-4 w-4 text-gray-400' />
                <SelectValue placeholder='Chọn phường/xã' />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.code} value={ward.code}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Actions and Results */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {hasActiveFilters && (
              <Button
                variant='ghost'
                size='sm'
                onClick={clearFilters}
                className='text-muted-foreground hover:text-foreground hover:bg-gray-100'
              >
                <X className='mr-2 h-4 w-4' />
                Xóa bộ lọc
              </Button>
            )}

            {/* Active filter badges */}
            <div className='flex gap-2'>
              {searchText && (
                <Badge
                  variant='secondary'
                  className='bg-pink-100 text-xs text-pink-800'
                >
                  Tìm kiếm: "{searchText}"
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-3 w-3 p-0 hover:bg-pink-200'
                    onClick={() => handleSearchChange('')}
                  >
                    <X className='h-2 w-2' />
                  </Button>
                </Badge>
              )}
              {provinceFilter && (
                <Badge
                  variant='secondary'
                  className='bg-blue-100 text-xs text-blue-800'
                >
                  Tỉnh:{' '}
                  {provinces.find((p) => p.code === provinceFilter)?.name ||
                    provinceFilter}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-3 w-3 p-0 hover:bg-blue-200'
                    onClick={() => handleProvinceChange('')}
                  >
                    <X className='h-2 w-2' />
                  </Button>
                </Badge>
              )}
              {wardFilter && (
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-xs text-green-800'
                >
                  Phường/Xã:{' '}
                  {wards.find((w) => w.code === wardFilter)?.name || wardFilter}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-3 w-3 p-0 hover:bg-green-200'
                    onClick={() => handleWardChange('')}
                  >
                    <X className='h-2 w-2' />
                  </Button>
                </Badge>
              )}
            </div>
          </div>

          <div className='text-muted-foreground flex items-center text-sm'>
            <Home className='mr-1 h-4 w-4' />
            {totalCount > 0
              ? `${startIndex}-${endIndex} trên ${totalCount}`
              : '0'}{' '}
            hộ gia đình
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border border-gray-200 shadow-sm'>
        <Table>
          <TableHeader className='bg-gray-50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='border-b border-gray-200'
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className='h-12 font-semibold text-gray-700'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`group hover:from-pink-25 border-b border-gray-100 transition-colors hover:bg-gradient-to-r hover:to-transparent ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='px-4 py-4'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='text-muted-foreground h-32 text-center'
                >
                  {hasActiveFilters ? (
                    <div className='space-y-4'>
                      <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                        <Search className='h-6 w-6 text-gray-400' />
                      </div>
                      <div>
                        <p className='text-base font-medium text-gray-900'>
                          Không tìm thấy hộ gia đình nào
                        </p>
                        <p className='text-sm text-gray-500'>
                          Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                        </p>
                      </div>
                      <Button
                        variant='outline'
                        onClick={clearFilters}
                        className='mt-4 border-pink-200 text-pink-700 hover:bg-pink-50'
                      >
                        <X className='mr-2 h-4 w-4' />
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                        <Home className='h-6 w-6 text-gray-400' />
                      </div>
                      <div>
                        <p className='text-base font-medium text-gray-900'>
                          Chưa có hộ gia đình nào
                        </p>
                        <p className='text-sm text-gray-500'>
                          Thêm hộ gia đình đầu tiên để bắt đầu quản lý
                        </p>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between rounded-lg border bg-gray-50 px-6 py-4'>
          <div className='text-muted-foreground flex items-center text-sm'>
            <Calendar className='mr-1 h-4 w-4' />
            Trang {currentPage} / {totalPages}
          </div>
          <div className='flex items-center space-x-2'>
            {/* Previous page button */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className='border-pink-200 text-pink-700 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Trước
            </Button>

            {/* Page numbers */}
            <div className='flex items-center space-x-1'>
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(1)}
                    className='border-pink-200 text-pink-700 hover:bg-pink-50'
                  >
                    1
                  </Button>
                  {currentPage > 4 && (
                    <span className='text-gray-400'>...</span>
                  )}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      pageNum === currentPage
                        ? 'bg-pink-600 text-white hover:bg-pink-700'
                        : 'border-pink-200 text-pink-700 hover:bg-pink-50'
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className='text-gray-400'>...</span>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(totalPages)}
                    className='border-pink-200 text-pink-700 hover:bg-pink-50'
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            {/* Next page button */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='border-pink-200 text-pink-700 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
