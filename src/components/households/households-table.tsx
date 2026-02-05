// Updated HouseholdsTable component - removes filteredData useMemo và sử dụng URL params
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
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
  Phone,
  Printer,
  Search,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { DeleteHouseholdDialog } from './delete-household-dialog';
import { EditHouseholdDialog } from './edit-household-dialog';
import { PrintHouseholdWrapper } from './print-household-wrapper';

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

  // Memoize provinces and wards to avoid recalculation
  const provinces = useMemo(() => getProvinces(), []);
  const wards = useMemo(
    () => (provinceFilter ? getWardsByProvince(provinceFilter) : []),
    [provinceFilter]
  );

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
            className='h-8 px-2 font-semibold hover:bg-green-100 hover:text-green-800'
          >
            <Home className='mr-2 h-4 w-4' />
            Tên hộ gia đình
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='space-y-1'>
          <div className='font-semibold text-green-900 transition-colors group-hover:text-green-700'>
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
            className='max-w-xs truncate text-sm text-green-900'
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
            className='h-8 px-2 font-semibold hover:bg-green-100 hover:text-green-800'
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
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Users className='mr-1 h-3 w-3' />
              {count} {count === 1 ? 'người' : 'người'}
            </Badge>
            {count > 5 && (
              <Badge
                variant='secondary'
                className='bg-amber-100 px-2 py-1 text-xs text-amber-800'
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
            className='h-8 px-2 font-semibold hover:bg-green-100 hover:text-green-800'
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
            <div className='text-sm font-medium text-green-900'>
              {format(date, 'dd/MM/yyyy', { locale: vi })}
            </div>
            <div className='text-muted-foreground flex items-center text-xs'>
              <Calendar className='mr-1 h-3 w-3' />
              {format(date, 'HH:mm', { locale: vi })}
              {isRecent && (
                <Badge
                  variant='secondary'
                  className='ml-2 bg-amber-100 px-2 py-0 text-xs text-amber-700'
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
          <TooltipProvider delayDuration={100}>
            <div className='flex items-center justify-center gap-1'>
              {/* View - opens drawer */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 cursor-pointer text-green-500 hover:bg-green-100 hover:text-green-800'
                    onClick={() => openHouseholdDrawer(household.id)}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Xem chi tiết</p>
                </TooltipContent>
              </Tooltip>

              {/* Print */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <PrintHouseholdWrapper
                    householdId={household.id}
                    householdName={household.household_name}
                    address={household.address}
                    phone={household.phone}
                    headOfHousehold={household.head_of_household}
                  >
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 cursor-pointer text-green-500 hover:bg-amber-50 hover:text-amber-600'
                    >
                      <Printer className='h-4 w-4' />
                    </Button>
                  </PrintHouseholdWrapper>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>In danh sách</p>
                </TooltipContent>
              </Tooltip>

              {/* Edit */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <EditHouseholdDialog household={household}>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 cursor-pointer text-green-500 hover:bg-amber-50 hover:text-amber-600'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </EditHouseholdDialog>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Chỉnh sửa</p>
                </TooltipContent>
              </Tooltip>

              {/* Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <DeleteHouseholdDialog
                    householdId={household.id}
                    householdName={household.household_name}
                  >
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 cursor-pointer text-green-500 hover:bg-red-50 hover:text-red-600'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </DeleteHouseholdDialog>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Xóa</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
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
    <div className='overflow-hidden rounded-xl border border-green-200 bg-white shadow-sm'>
      {/* Search and Filters */}
      <div className='border-b border-green-100 bg-green-50/30 p-4'>
        {/* Search and Filters Row */}
        <div className='flex flex-col gap-4 sm:flex-row'>
          {/* Search by Name/Phone */}
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
            <Input
              placeholder='Tìm kiếm theo tên hộ gia đình, chủ hộ, số điện thoại...'
              value={searchText}
              onChange={(event) => handleSearchChange(event.target.value)}
              className='border-green-200 bg-white pr-10 pl-10 focus:border-green-500 focus:ring-green-200'
            />
            {searchText && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-1.5 right-1.5 h-6 w-6 cursor-pointer p-0 text-gray-400 hover:text-gray-600'
                onClick={() => handleSearchChange('')}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>

          {/* Location Filters */}
          <div className='flex gap-3'>
            <Select value={provinceFilter} onValueChange={handleProvinceChange}>
              <SelectTrigger className='w-[200px] border-green-200 bg-white focus:border-green-500 focus:ring-green-200'>
                <MapPin className='mr-2 h-4 w-4 text-green-600' />
                <SelectValue placeholder='Tỉnh/thành phố' />
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
              <SelectTrigger className='w-[200px] border-green-200 bg-white focus:border-green-500 focus:ring-green-200'>
                <MapPin className='mr-2 h-4 w-4 text-green-600' />
                <SelectValue placeholder='Phường/xã' />
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
        {(hasActiveFilters || totalCount > 0) && (
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {hasActiveFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='h-7 cursor-pointer px-2 text-xs text-green-700 hover:bg-green-100 hover:text-green-800'
                >
                  <X className='mr-1 h-3 w-3' />
                  Xóa bộ lọc
                </Button>
              )}

              {/* Active filter badges */}
              {searchText && (
                <Badge
                  variant='secondary'
                  className='flex cursor-pointer items-center gap-1 bg-green-100 px-2 py-0.5 text-xs text-green-800 transition-colors hover:bg-green-200'
                  onClick={() => handleSearchChange('')}
                >
                  "{searchText}"
                  <X className='h-3 w-3' />
                </Badge>
              )}
              {provinceFilter && (
                <Badge
                  variant='secondary'
                  className='flex cursor-pointer items-center gap-1 bg-amber-100 px-2 py-0.5 text-xs text-amber-800 transition-colors hover:bg-amber-200'
                  onClick={() => handleProvinceChange('')}
                >
                  {provinces.find((p) => p.code === provinceFilter)?.name ||
                    provinceFilter}
                  <X className='h-3 w-3' />
                </Badge>
              )}
              {wardFilter && (
                <Badge
                  variant='secondary'
                  className='flex cursor-pointer items-center gap-1 bg-green-100 px-2 py-0.5 text-xs text-green-800 transition-colors hover:bg-green-200'
                  onClick={() => handleWardChange('')}
                >
                  {wards.find((w) => w.code === wardFilter)?.name || wardFilter}
                  <X className='h-3 w-3' />
                </Badge>
              )}
            </div>

            <div className='text-xs text-green-700/70'>
              {totalCount > 0
                ? `${startIndex}-${endIndex} / ${totalCount}`
                : '0'}{' '}
              hộ gia đình
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader className='bg-green-50/50'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className='border-b border-green-100'
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className='h-12 font-semibold text-green-900'
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
                className={`group cursor-pointer border-b border-green-50 transition-colors duration-150 hover:bg-green-50/50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-amber-50/20'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='px-4 py-4'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='text-muted-foreground h-48 text-center'
              >
                {hasActiveFilters ? (
                  <div className='flex flex-col items-center justify-center space-y-4'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                      <Search className='h-7 w-7 text-green-600' />
                    </div>
                    <div className='space-y-1'>
                      <p className='text-base font-semibold text-green-900'>
                        Không tìm thấy kết quả
                      </p>
                      <p className='max-w-sm text-sm text-green-700/70'>
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để tìm hộ
                        gia đình phù hợp
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      onClick={clearFilters}
                      className='mt-2 cursor-pointer border-green-200 text-green-700 transition-colors hover:bg-green-50'
                    >
                      <X className='mr-2 h-4 w-4' />
                      Xóa bộ lọc
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center space-y-4'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                      <Home className='h-7 w-7 text-green-600' />
                    </div>
                    <div className='space-y-1'>
                      <p className='text-base font-semibold text-green-900'>
                        Chưa có hộ gia đình nào
                      </p>
                      <p className='max-w-sm text-sm text-green-700/70'>
                        Bắt đầu bằng cách thêm hộ gia đình đầu tiên để quản lý
                        thông tin
                      </p>
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-green-100 bg-green-50/30 px-4 py-3'>
          <div className='text-xs text-green-700/70'>
            Trang {currentPage} / {totalPages}
          </div>
          <div className='flex items-center space-x-1'>
            {/* Previous page button */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className='h-8 cursor-pointer px-3 text-xs text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Trước
            </Button>

            {/* Page numbers */}
            <div className='flex items-center'>
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handlePageChange(1)}
                    className='h-8 w-8 cursor-pointer text-xs text-green-700 hover:bg-green-100'
                  >
                    1
                  </Button>
                  {currentPage > 4 && (
                    <span className='px-1 text-xs text-green-500'>...</span>
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
                    variant='ghost'
                    size='sm'
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 w-8 cursor-pointer text-xs ${
                      pageNum === currentPage
                        ? 'bg-green-700 text-white hover:bg-green-800'
                        : 'text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className='px-1 text-xs text-green-500'>...</span>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handlePageChange(totalPages)}
                    className='h-8 w-8 cursor-pointer text-xs text-green-700 hover:bg-green-100'
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            {/* Next page button */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='h-8 cursor-pointer px-3 text-xs text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
