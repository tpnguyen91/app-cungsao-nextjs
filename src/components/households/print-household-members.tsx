'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import provincesData from '@/data/province.json';
import wardsData from '@/data/ward.json';
import { getCanChi, getSaoChieuMenh, getVanHan } from '@/lib/utils';
import type { FamilyMember } from '@/types/database';
import { Printer } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface PrintHouseholdData {
  id: string;
  household_name?: string;
  address: string;
  phone?: string;
  province_code?: string;
  ward_code?: string;
  head_of_household?: {
    id: string;
    full_name: string;
  };
}

interface PrintHouseholdMembersProps {
  household: PrintHouseholdData;
  members: FamilyMember[];
  children?: React.ReactNode;
}

export function PrintHouseholdMembers({
  household,
  members,
  children
}: PrintHouseholdMembersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const calculateAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear + 1;
  };

  const getHeadOfHousehold = () => {
    return (
      members.find((member) => member.is_head_of_household) ||
      household.head_of_household
    );
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

  const sortedMembers = [...members].sort((a, b) => {
    // Chủ hộ luôn đứng đầu
    if (a.is_head_of_household && !b.is_head_of_household) return -1;
    if (!a.is_head_of_household && b.is_head_of_household) return 1;

    // Sắp xếp theo tuổi giảm dần
    return b.birth_year - a.birth_year;
  });

  // Cấu hình react-to-print (API mới)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: '', //`Danh-sach-thanh-vien-${household.household_name || 'gia-dinh'}-${format(new Date(), 'dd-MM-yyyy')}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .print-content {
          width: 100% !important;
          padding: 0;
          margin: 0;
        }
        
        table {
          width: 100% !important;
        }
      }
    `
  });

  const onPrintClick = () => {
    if (handlePrint) {
      handlePrint();
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant='outline' size='sm'>
              <Printer className='mr-2 h-4 w-4' />
              In danh sách
            </Button>
          )}
        </DialogTrigger>

        <DialogContent
          className='max-h-[90vh] overflow-y-scroll'
          style={{ width: 650, maxWidth: '210mm' }}
        >
          <DialogHeader className='print:hidden'>
            <DialogTitle className='flex items-center justify-between'>
              <Button onClick={onPrintClick}>
                <Printer className='mr-2 h-4 w-4' />
                In ngay
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Print Content - Nội dung sẽ được in */}
          <div
            ref={printRef}
            className='print-content w-full rounded bg-white p-6'
          >
            {/* Header */}
            <div className='mb-4 border-b-2 border-gray-800 pb-3'>
              <h1 className='mb-3 text-center text-2xl font-bold tracking-wide uppercase'>
                Sớ Cúng Sao
              </h1>

              <div className='space-y-1 text-sm'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center'>
                    <span className='font-semibold'>Chủ hộ:</span>
                    <span className='ml-1'>
                      {getHeadOfHousehold()?.full_name || 'Chưa xác định'}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <span className='font-semibold'>SĐT:</span>
                    <span className='ml-1'>{household.phone || '-'}</span>
                  </div>
                </div>
                <div className='flex items-start'>
                  <span className='font-semibold'>Địa chỉ:</span>
                  <span className='ml-1'>
                    {[
                      household.address,
                      getWardName(household.ward_code),
                      getProvinceName(household.province_code)
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-gray-800 text-xs'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='w-8 border border-gray-800 p-1.5 text-center font-bold'>
                      STT
                    </th>
                    <th className='border border-gray-800 p-1.5 text-center font-bold'>
                      Họ và tên
                    </th>
                    <th className='border border-gray-800 p-1.5 text-center font-bold'>
                      Pháp danh
                    </th>
                    <th className='w-16 border border-gray-800 p-1.5 text-center font-bold'>
                      Tuổi
                    </th>
                    <th className='w-24 border border-gray-800 p-1.5 text-center font-bold'>
                      Sao chiếu mệnh
                    </th>
                    <th className='w-24 border border-gray-800 p-1.5 text-center font-bold'>
                      Vận hạn
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => (
                    <tr key={member.id}>
                      <td className='border border-gray-800 p-1.5 text-center'>
                        {index + 1}
                      </td>
                      <td className='border border-gray-800 p-1.5'>
                        <div className='font-medium'>{member.full_name}</div>
                        {member.is_head_of_household && (
                          <Badge
                            variant='secondary'
                            className='mt-0.5 bg-blue-100 text-[10px] text-blue-800'
                          >
                            Chủ hộ
                          </Badge>
                        )}
                      </td>
                      <td className='border border-gray-800 p-1.5 text-center'>
                        {member.dharma_name || (
                          <span className='text-gray-500 italic'>-</span>
                        )}
                      </td>
                      <td className='border border-gray-800 p-1.5 text-center'>
                        <div className='font-medium'>
                          {calculateAge(member.birth_year)} tuổi
                        </div>
                        <div className='text-[10px] text-gray-600'>
                          {getCanChi(member.birth_year)}
                        </div>
                      </td>
                      <td className='border border-gray-800 p-1.5 text-center'>
                        <span className='font-medium text-amber-700'>
                          {getSaoChieuMenh(
                            member.birth_year,
                            member.gender as string
                          )}
                        </span>
                      </td>
                      <td className='border border-gray-800 p-1.5 text-center'>
                        <span className='font-medium text-purple-700'>
                          {
                            getVanHan(
                              member.birth_year,
                              member.gender as string
                            ).han
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
