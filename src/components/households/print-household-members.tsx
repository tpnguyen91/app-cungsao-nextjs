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
import { GENDER_LABELS } from '@/features/family-members/schemas/family-member-schema';
import { getCanChi, getSaoChieuMenh, getVanHan } from '@/lib/utils';
import type { FamilyMember } from '@/types/database';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MapPin, Phone, Printer, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface PrintHouseholdData {
  id: string;
  household_name?: string;
  address: string;
  phone?: string;
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
    return new Date().getFullYear() - birthYear;
  };

  const formatPrintDate = () => {
    return format(new Date(), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
  };

  const getHeadOfHousehold = () => {
    return (
      members.find((member) => member.is_head_of_household) ||
      household.head_of_household
    );
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
    documentTitle: `Danh-sach-thanh-vien-${household.household_name || 'gia-dinh'}-${format(new Date(), 'dd-MM-yyyy')}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 15mm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .print-content {
          padding: 0;
          margin: 0;
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
          style={{ width: 950, maxWidth: '297mm' }}
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
            className='print-content rounded bg-white p-6 shadow-sm'
            style={{
              minHeight: '21cm',
              width: 900
            }}
          >
            {/* Header */}
            <div className='mb-6 border-b-2 border-gray-800 pb-4'>
              <h1 className='mb-4 text-center text-2xl font-bold uppercase'>
                Danh sách thành viên gia đình - Cúng sao
              </h1>

              <div className='mb-4 grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    <span className='font-semibold'>Chủ hộ:</span>
                    <span>
                      {getHeadOfHousehold()?.full_name || 'Chưa xác định'}
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <MapPin className='mt-0.5 h-4 w-4' />
                    <span className='font-semibold'>Địa chỉ:</span>
                    <span>{household.address}</span>
                  </div>
                </div>
                <div className='space-y-2'>
                  {household.phone && (
                    <div className='flex flex-row items-center space-x-1'>
                      <Phone className='h-4 w-4' />
                      <span className='font-semibold'>Số điện thoại:</span>
                      <span>{household.phone}</span>
                    </div>
                  )}
                  <div className='flex flex-row items-center space-x-1'>
                    <Users className='h-4 w-4' />
                    <span className='font-semibold'>Tổng thành viên:</span>
                    <Badge variant='secondary' className='ml-2'>
                      {members.length} người
                    </Badge>
                  </div>
                  <div className='flex flex-row items-center space-x-1 text-sm text-gray-600'>
                    <span className='font-semibold'>Ngày in:</span>
                    <span>{formatPrintDate()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full border-collapse border border-gray-800 text-sm'>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='w-12 border border-gray-800 p-2 text-center font-bold'>
                      STT
                    </th>
                    <th className='w-36 border border-gray-800 p-2 text-center font-bold'>
                      Họ và tên
                    </th>
                    <th className='w-28 border border-gray-800 p-2 text-center font-bold'>
                      Pháp danh
                    </th>
                    <th className='w-20 border border-gray-800 p-2 text-center font-bold'>
                      Tuổi
                    </th>
                    <th className='w-24 border border-gray-800 p-2 text-center font-bold'>
                      Sao chiếu mệnh
                    </th>
                    <th className='w-20 border border-gray-800 p-2 text-center font-bold'>
                      Vận hạn
                    </th>
                    <th className='w-16 border border-gray-800 p-2 text-center font-bold'>
                      Giới tính
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => (
                    <tr key={member.id}>
                      <td className='border border-gray-800 p-2 text-center'>
                        {index + 1}
                      </td>
                      <td className='border border-gray-800 p-2'>
                        <div className='font-medium'>{member.full_name}</div>
                        {member.is_head_of_household && (
                          <Badge
                            variant='secondary'
                            className='mt-1 bg-blue-100 text-xs text-blue-800'
                          >
                            Chủ hộ
                          </Badge>
                        )}
                      </td>
                      <td className='border border-gray-800 p-2 text-center'>
                        {member.dharma_name || (
                          <span className='text-gray-500 italic'>-</span>
                        )}
                      </td>
                      <td className='border border-gray-800 p-2 text-center'>
                        <div className='font-medium'>
                          {calculateAge(member.birth_year)} tuổi
                        </div>
                        <div className='text-xs text-gray-600'>
                          {getCanChi(member.birth_year)}
                        </div>
                      </td>
                      <td className='border border-gray-800 p-2 text-center'>
                        <span className='font-medium text-amber-700'>
                          {getSaoChieuMenh(
                            member.birth_year,
                            member.gender as string
                          )}
                        </span>
                      </td>
                      <td className='border border-gray-800 p-2 text-center'>
                        <span className='font-medium text-purple-700'>
                          {
                            getVanHan(
                              member.birth_year,
                              member.gender as string
                            ).han
                          }
                        </span>
                      </td>
                      <td className='border border-gray-800 p-2 text-center'>
                        <Badge variant='outline' className='text-xs'>
                          {GENDER_LABELS[
                            member.gender as keyof typeof GENDER_LABELS
                          ] || member.gender}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className='mt-6 flex items-end justify-between text-sm'>
              <div>
                <div className='mb-2 font-semibold'>Ghi chú:</div>
                <div className='space-y-1 text-xs'>
                  <div>
                    - Danh sách được sắp xếp theo thứ tự: Chủ hộ, sau đó theo
                    tuổi giảm dần
                  </div>
                  <div>- Sao chiếu mệnh và vận hạn được tính theo âm lịch</div>
                </div>
              </div>
              <div className='text-center'>
                <div className='mb-2 font-semibold'>Người lập danh sách</div>
                <div className='w-32 border-t border-gray-400 pt-16 text-center text-xs'>
                  (Ký tên và đóng dấu)
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
