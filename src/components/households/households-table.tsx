// File: src/components/households/households-table.tsx - STYLED VERSION
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
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
}

export function HouseholdsTable({ households }: HouseholdsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [searchText, setSearchText] = React.useState('');
  const [provinceFilter, setProvinceFilter] = React.useState<string>('');
  const [wardFilter, setWardFilter] = React.useState<string>('');
  const { openHouseholdDrawer } = useHouseholdNavigation();

  const getMemberCount = (household: Household) => {
    return household?.member_count || 0;
  };

  // Get unique provinces and wards
  const uniqueProvinces = React.useMemo(() => {
    const provinces = households
      .map((h) => h.province_id)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return provinces;
  }, [households]);

  const uniqueWards = React.useMemo(() => {
    const wards = households
      .filter((h) => !provinceFilter || h.province_id === provinceFilter)
      .map((h) => h.ward_id)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return wards;
  }, [households, provinceFilter]);

  // Apply filters
  const filteredData = React.useMemo(() => {
    return households.filter((household) => {
      // Search text filter
      if (searchText) {
        const searchableText = [
          household.household_name,
          household.head_of_household?.full_name,
          household.phone
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchText.toLowerCase())) {
          return false;
        }
      }

      // Province filter
      if (provinceFilter && household.province_id !== provinceFilter) {
        return false;
      }

      // Ward filter
      if (wardFilter && household.ward_id !== wardFilter) {
        return false;
      }

      return true;
    });
  }, [households, searchText, provinceFilter, wardFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchText('');
    setProvinceFilter('');
    setWardFilter('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchText || provinceFilter || wardFilter;

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
          Địa chỉ
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
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
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
                onChange={(event) => setSearchText(event.target.value)}
                className='border-gray-200 pr-10 pl-10 focus:border-pink-300 focus:ring-pink-200'
              />
              {searchText && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute top-1.5 right-1.5 h-6 w-6 p-0 text-gray-400 hover:text-gray-600'
                  onClick={() => setSearchText('')}
                >
                  <X className='h-3 w-3' />
                </Button>
              )}
            </div>
          </div>

          {/* Location Filters */}
          <div className='flex gap-3'>
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className='w-[250px] border-gray-200 focus:border-pink-300 focus:ring-pink-200'>
                <MapPin className='mr-2 h-4 w-4 text-gray-400' />
                <SelectValue placeholder='Chọn tỉnh/thành phố' />
              </SelectTrigger>
              <SelectContent>
                {uniqueProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={wardFilter}
              onValueChange={setWardFilter}
              disabled={!provinceFilter}
            >
              <SelectTrigger className='w-[250px] border-gray-200 focus:border-pink-300 focus:ring-pink-200'>
                <MapPin className='mr-2 h-4 w-4 text-gray-400' />
                <SelectValue placeholder='Chọn phường/xã' />
              </SelectTrigger>
              <SelectContent>
                {uniqueWards.map((ward) => (
                  <SelectItem key={ward} value={ward}>
                    {ward}
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
                    onClick={() => setSearchText('')}
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
                  Tỉnh: {provinceFilter}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-3 w-3 p-0 hover:bg-blue-200'
                    onClick={() => setProvinceFilter('')}
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
                  Phường/Xã: {wardFilter}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='ml-2 h-3 w-3 p-0 hover:bg-green-200'
                    onClick={() => setWardFilter('')}
                  >
                    <X className='h-2 w-2' />
                  </Button>
                </Badge>
              )}
            </div>
          </div>

          <div className='text-muted-foreground flex items-center text-sm'>
            <Home className='mr-1 h-4 w-4' />
            {filteredData.length} / {households.length} hộ gia đình
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
      {table.getPageCount() > 1 && (
        <div className='flex items-center justify-between rounded-lg border bg-gray-50 px-6 py-4'>
          <div className='text-muted-foreground flex items-center text-sm'>
            <Calendar className='mr-1 h-4 w-4' />
            Trang {table.getState().pagination.pageIndex + 1} /{' '}
            {table.getPageCount()}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className='border-pink-200 text-pink-700 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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
