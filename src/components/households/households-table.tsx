// File: src/components/households/households-table.tsx - TANSTACK VERSION
'use client';

import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Eye,
  ArrowUpDown,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { EditHouseholdDialog } from './edit-household-dialog';
import { DeleteHouseholdDialog } from './delete-household-dialog';

export interface Household {
  id: string;
  household_name: string;
  address: string;
  province_id?: string;
  ward_id?: string;
  created_at: string;
  head_of_household?: {
    id: string;
    full_name: string;
  };
  _count?: { count: number }[];
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
  const [globalFilter, setGlobalFilter] = React.useState('');

  const getMemberCount = (household: Household) => {
    return household._count?.[0]?.count || 0;
  };

  const columns: ColumnDef<Household>[] = [
    {
      accessorKey: 'household_name',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2 hover:bg-pink-50 hover:text-pink-700'
          >
            Tên hộ gia đình
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('household_name')}</div>
      )
    },
    {
      accessorKey: 'address',
      header: 'Địa chỉ',
      cell: ({ row }) => (
        <div className='max-w-xs truncate' title={row.getValue('address')}>
          {row.getValue('address')}
        </div>
      )
    },
    {
      accessorKey: 'head_of_household',
      header: 'Chủ hộ',
      cell: ({ row }) => {
        const headOfHousehold = row.getValue(
          'head_of_household'
        ) as Household['head_of_household'];
        return headOfHousehold ? (
          <Badge variant='secondary'>{headOfHousehold.full_name}</Badge>
        ) : (
          <span className='text-muted-foreground text-sm'>Chưa chọn</span>
        );
      }
    },
    {
      accessorKey: '_count',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-8 px-2'
          >
            Thành viên
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const count = getMemberCount(row.original);
        return (
          <Badge variant='outline' className='font-mono'>
            {count} thành viên
          </Badge>
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
            className='h-8 px-2'
          >
            Ngày tạo
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        return format(new Date(row.getValue('created_at')), 'dd/MM/yyyy', {
          locale: vi
        });
      }
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const household = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/households/${household.id}`}
                  className='flex items-center'
                >
                  <Eye className='mr-2 h-4 w-4' />
                  Xem chi tiết
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/households/${household.id}/members`}
                  className='flex items-center'
                >
                  <Users className='mr-2 h-4 w-4' />
                  Quản lý thành viên
                </Link>
              </DropdownMenuItem>
              <EditHouseholdDialog household={household}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className='mr-2 h-4 w-4' />
                  Chỉnh sửa
                </DropdownMenuItem>
              </EditHouseholdDialog>
              <DropdownMenuSeparator />
              <DeleteHouseholdDialog
                householdId={household.id}
                householdName={household.household_name}
              >
                <DropdownMenuItem
                  className='text-red-600 focus:text-red-600'
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Xóa
                </DropdownMenuItem>
              </DeleteHouseholdDialog>
            </DropdownMenuContent>
          </DropdownMenu>
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
            <Input
              placeholder='Tìm kiếm hộ gia đình...'
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className='max-w-sm pl-8'
            />
          </div>
          <Button
            variant='outline'
            size='sm'
            className='border-pink-200 text-pink-700 hover:bg-pink-50'
          >
            <Filter className='mr-2 h-4 w-4' />
            Bộ lọc
          </Button>
        </div>
        <div className='text-muted-foreground text-sm'>
          {table.getFilteredRowModel().rows.length} / {households.length} hộ gia
          đình
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className='h-12'>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='hover:bg-muted/50'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-3'>
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
                  className='text-muted-foreground h-24 text-center'
                >
                  {globalFilter ? (
                    <div>
                      <p>
                        Không tìm thấy hộ gia đình nào với từ khóa "
                        {globalFilter}"
                      </p>
                      <Button
                        variant='link'
                        onClick={() => setGlobalFilter('')}
                        className='mt-2 text-pink-600 hover:text-pink-700'
                      >
                        Xóa bộ lọc
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p>Chưa có hộ gia đình nào.</p>
                      <p className='text-sm'>
                        Thêm hộ gia đình đầu tiên để bắt đầu.
                      </p>
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
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground text-sm'>
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
