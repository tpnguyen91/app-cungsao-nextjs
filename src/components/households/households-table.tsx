// Updated HouseholdsTable component - TailAdmin style
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
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
import provincesData from '@/data/province.json';
import wardsData from '@/data/ward.json';
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
  Check,
  ChevronsUpDown,
  Edit,
  Eye,
  Home,
  MapPin,
  Phone,
  Plus,
  Printer,
  Search,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { CreateHouseholdDialog } from './create-household-dialog';
import { DeleteHouseholdDialog } from './delete-household-dialog';
import { EditHouseholdDialog } from './edit-household-dialog';
import { PrintHouseholdWrapper } from './print-household-wrapper';

export interface Household {
  id: string;
  household_name: string;
  address: string;
  province_code?: string;
  ward_code?: string;
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

  const [provinceOpen, setProvinceOpen] = React.useState(false);
  const [wardOpen, setWardOpen] = React.useState(false);

  const { openHouseholdDrawer } = useHouseholdNavigation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update local state when props change
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
      }, 500);
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

    if (!updates.page) {
      params.delete('page');
    }

    debouncedUpdateURL(params);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    updateURLParams({ search: value });
  };

  const handleProvinceChange = (value: string) => {
    setProvinceFilter(value);
    setWardFilter('');
    updateURLParams({ province: value, ward: '' });
  };

  const handleWardChange = (value: string) => {
    setWardFilter(value);
    updateURLParams({ ward: value });
  };

  const clearFilters = () => {
    setSearchText('');
    setProvinceFilter('');
    setWardFilter('');
    router.push(window.location.pathname);
  };

  const handlePageChange = (newPage: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const page = parseInt(newPage);
    if (page > 1) {
      params.set('page', newPage);
    } else {
      params.delete('page');
    }
    router.push(`?${params.toString()}`);
  };

  const getMemberCount = (household: Household) => {
    return household?.member_count || 0;
  };

  // Helper functions to get province/ward names by code
  const getProvinceName = (code: string | undefined) => {
    if (!code) return null;
    const province = (provincesData as Record<string, { name: string }>)[code];
    return province?.name || null;
  };

  const getWardName = (code: string | undefined) => {
    if (!code) return null;
    const ward = (wardsData as Record<string, { name: string }>)[code];
    return ward?.name || null;
  };

  const provinces = useMemo(() => getProvinces(), []);
  const wards = useMemo(
    () => (provinceFilter ? getWardsByProvince(provinceFilter) : []),
    [provinceFilter]
  );

  const hasActiveFilters = searchText || provinceFilter || wardFilter;
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
            className='h-8 px-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          >
            <Home className='mr-2 h-4 w-4' />
            Hộ gia đình
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = getMemberCount(row.original);
        return (
          <div className='space-y-1.5'>
            <div className='group-hover:text-primary font-medium text-slate-800 transition-colors'>
              {row.getValue('household_name')}
            </div>
            {row.original.head_of_household && (
              <div className='flex items-center text-xs text-slate-500'>
                <Users className='mr-1 h-3 w-3' />
                Chủ hộ: {row.original.head_of_household.full_name}
              </div>
            )}
            <Badge
              variant={count > 0 ? 'default' : 'secondary'}
              className={`px-2 py-0.5 font-mono text-xs ${
                count > 0
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Users className='mr-1 h-3 w-3' />
              {count} thành viên
            </Badge>
          </div>
        );
      }
    },
    {
      accessorKey: 'phone',
      header: () => (
        <div className='flex items-center font-medium text-slate-600'>
          <Phone className='mr-2 h-4 w-4' />
          Số điện thoại
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-sm text-slate-700'>
          {row.original.phone || '-'}
        </div>
      )
    },
    {
      accessorKey: 'address',
      header: () => (
        <div className='flex items-center font-medium text-slate-600'>
          <MapPin className='mr-2 h-4 w-4' />
          Địa chỉ
        </div>
      ),
      cell: ({ row }) => {
        const address = row.getValue('address') as string;
        const wardName = getWardName(row.original.ward_code);
        const provinceName = getProvinceName(row.original.province_code);

        // Build address parts
        const addressParts = [address, wardName, provinceName].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        return (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='max-w-xs cursor-default space-y-0.5 text-sm text-slate-700'>
                  {address && <div className='truncate'>{address}</div>}
                  {(wardName || provinceName) && (
                    <div className='truncate text-xs text-slate-500'>
                      {[wardName, provinceName].filter(Boolean).join(', ')}
                    </div>
                  )}
                  {!address && !wardName && !provinceName && '-'}
                </div>
              </TooltipTrigger>
              {fullAddress && (
                <TooltipContent side='top' className='max-w-sm'>
                  <p>{fullAddress}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          >
            <Calendar className='mr-2 h-4 w-4' />
            Ngày tạo
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('created_at'));
        return (
          <div className='text-sm font-medium text-slate-700'>
            {format(date, 'dd/MM/yyyy', { locale: vi })}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: () => (
        <div className='text-center font-medium text-slate-600'>Thao tác</div>
      ),
      cell: ({ row }) => {
        const household = row.original;

        return (
          <TooltipProvider delayDuration={100}>
            <div className='flex items-center justify-center gap-1'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='hover:bg-primary/10 hover:text-primary h-8 w-8 cursor-pointer text-slate-500'
                    onClick={() => openHouseholdDrawer(household.id)}
                  >
                    <Eye className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Xem chi tiết</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <PrintHouseholdWrapper
                    householdId={household.id}
                    householdName={household.household_name}
                    address={household.address}
                    phone={household.phone}
                    province_code={household.province_code}
                    ward_code={household.ward_code}
                    headOfHousehold={household.head_of_household}
                  >
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 cursor-pointer text-slate-500 hover:bg-amber-50 hover:text-amber-600'
                    >
                      <Printer className='h-4 w-4' />
                    </Button>
                  </PrintHouseholdWrapper>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>In danh sách</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <EditHouseholdDialog household={household}>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 cursor-pointer text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </EditHouseholdDialog>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Chỉnh sửa</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <DeleteHouseholdDialog
                    householdId={household.id}
                    householdName={household.household_name}
                  >
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 cursor-pointer text-slate-500 hover:bg-red-50 hover:text-red-600'
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
    data: households,
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
    manualPagination: true,
    manualFiltering: true,
    pageCount: totalPages
  });

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
      {/* Search and Filters */}
      <div className='shrink-0 border-b border-slate-100 bg-white p-4'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          {/* Search */}
          <div className='relative flex-1'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Tìm kiếm theo tên hộ gia đình, số điện thoại...'
              value={searchText}
              onChange={(event) => handleSearchChange(event.target.value)}
              className='focus:border-primary focus:ring-primary/20 border-slate-200 bg-white pr-10 pl-10'
            />
            {searchText && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-1.5 right-1.5 h-6 w-6 cursor-pointer p-0 text-slate-400 hover:text-slate-600'
                onClick={() => handleSearchChange('')}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>

          {/* Location Filters */}
          <div className='flex gap-3'>
            <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={provinceOpen}
                  className='focus:border-primary focus:ring-primary/20 w-[200px] justify-between border-slate-200 bg-white'
                >
                  <div className='flex items-center truncate'>
                    <MapPin className='mr-2 h-4 w-4 shrink-0 text-slate-400' />
                    <span className='truncate'>
                      {provinceFilter
                        ? provinces.find((p) => p.code === provinceFilter)?.name
                        : 'Tỉnh/thành phố'}
                    </span>
                  </div>
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[200px] p-0'>
                <Command>
                  <CommandInput placeholder='Tìm tỉnh/thành phố...' />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      {provinces.map((province) => (
                        <CommandItem
                          key={province.code}
                          value={province.name}
                          onSelect={() => {
                            handleProvinceChange(
                              province.code === provinceFilter
                                ? ''
                                : province.code
                            );
                            setProvinceOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              provinceFilter === province.code
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                          />
                          {province.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover open={wardOpen} onOpenChange={setWardOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={wardOpen}
                  disabled={!provinceFilter}
                  className='focus:border-primary focus:ring-primary/20 w-[200px] justify-between border-slate-200 bg-white'
                >
                  <div className='flex items-center truncate'>
                    <MapPin className='mr-2 h-4 w-4 shrink-0 text-slate-400' />
                    <span className='truncate'>
                      {wardFilter
                        ? wards.find((w) => w.code === wardFilter)?.name
                        : 'Phường/xã'}
                    </span>
                  </div>
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[200px] p-0'>
                <Command>
                  <CommandInput placeholder='Tìm phường/xã...' />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      {wards.map((ward) => (
                        <CommandItem
                          key={ward.code}
                          value={ward.name}
                          onSelect={() => {
                            handleWardChange(
                              ward.code === wardFilter ? '' : ward.code
                            );
                            setWardOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              wardFilter === ward.code
                                ? 'opacity-100'
                                : 'opacity-0'
                            }`}
                          />
                          {ward.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <CreateHouseholdDialog>
              <Button className='bg-primary hover:bg-primary/90 cursor-pointer gap-2 px-4 shadow-sm'>
                <Plus className='h-4 w-4' />
                Thêm hộ gia đình
              </Button>
            </CreateHouseholdDialog>
          </div>
        </div>

        {/* Filter Actions */}
        {(hasActiveFilters || totalCount > 0) && (
          <div className='mt-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {hasActiveFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='h-7 cursor-pointer px-2 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                >
                  <X className='mr-1 h-3 w-3' />
                  Xóa bộ lọc
                </Button>
              )}

              {searchText && (
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary hover:bg-primary/20 flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs transition-colors'
                  onClick={() => handleSearchChange('')}
                >
                  "{searchText}"
                  <X className='h-3 w-3' />
                </Badge>
              )}
              {provinceFilter && (
                <Badge
                  variant='secondary'
                  className='flex cursor-pointer items-center gap-1 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 transition-colors hover:bg-amber-100'
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
                  className='flex cursor-pointer items-center gap-1 bg-sky-50 px-2 py-0.5 text-xs text-sky-700 transition-colors hover:bg-sky-100'
                  onClick={() => handleWardChange('')}
                >
                  {wards.find((w) => w.code === wardFilter)?.name || wardFilter}
                  <X className='h-3 w-3' />
                </Badge>
              )}
            </div>

            <div className='text-xs text-slate-500'>
              {totalCount > 0
                ? `${startIndex}-${endIndex} / ${totalCount}`
                : '0'}{' '}
              hộ gia đình
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className='min-h-0 flex-1 overflow-auto'>
        <Table>
          <TableHeader className='sticky top-0 z-10 bg-slate-50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='border-b border-slate-200'
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className='h-12 font-medium text-slate-600'
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
                  className={`group cursor-pointer border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
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
                  className='h-48 text-center text-slate-500'
                >
                  {hasActiveFilters ? (
                    <div className='flex flex-col items-center justify-center space-y-4'>
                      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
                        <Search className='h-7 w-7 text-slate-400' />
                      </div>
                      <div className='space-y-1'>
                        <p className='text-base font-medium text-slate-700'>
                          Không tìm thấy kết quả
                        </p>
                        <p className='max-w-sm text-sm text-slate-500'>
                          Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc
                        </p>
                      </div>
                      <Button
                        variant='outline'
                        onClick={clearFilters}
                        className='mt-2 cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50'
                      >
                        <X className='mr-2 h-4 w-4' />
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center space-y-4'>
                      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-100'>
                        <Home className='h-7 w-7 text-slate-400' />
                      </div>
                      <div className='space-y-1'>
                        <p className='text-base font-medium text-slate-700'>
                          Chưa có hộ gia đình nào
                        </p>
                        <p className='max-w-sm text-sm text-slate-500'>
                          Bắt đầu bằng cách thêm hộ gia đình đầu tiên
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

      {/* Footer Pagination */}
      <div className='shrink-0 border-t border-slate-200 bg-white px-4 py-2.5'>
        <div className='flex items-center justify-between'>
          <div className='text-xs text-slate-500'>
            {totalCount > 0 ? (
              <span>
                {currentPage * pageSize > totalCount
                  ? totalCount
                  : currentPage * pageSize}{' '}
                / {totalCount}
              </span>
            ) : (
              <span>0 / 0</span>
            )}
          </div>

          {totalPages > 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-xs text-slate-500'>Trang</span>
              <Select
                value={currentPage.toString()}
                onValueChange={handlePageChange}
              >
                <SelectTrigger className='focus:border-primary focus:ring-primary/20 h-8 w-[70px] border-slate-200 bg-white text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className='text-xs text-slate-500'>/ {totalPages}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
