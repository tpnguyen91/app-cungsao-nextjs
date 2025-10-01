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
import { Calendar, MapPin, Phone, Printer, Users } from 'lucide-react';
import { useState } from 'react';

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

  const calculateAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear;
  };

  const handlePrint = () => {
    window.print();
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

        <DialogContent className='max-h-[90vh] max-w-6xl overflow-auto'>
          <DialogHeader className='print:hidden'>
            <DialogTitle className='flex items-center justify-between'>
              <span>Xem trước bản in</span>
              <Button onClick={handlePrint} className='ml-4'>
                <Printer className='mr-2 h-4 w-4' />
                In ngay
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Print Styles */}
          <style jsx>{`
            @media print {
              @page {
                size: A4 landscape;
                margin: 15mm;
              }

              body * {
                visibility: hidden;
              }

              .print-content,
              .print-content * {
                visibility: visible;
              }

              .print-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
              }

              .print-header {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #000;
              }

              .print-title {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
                text-transform: uppercase;
              }

              .print-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 15px;
              }

              .print-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
              }

              .print-table th,
              .print-table td {
                border: 1px solid #000;
                padding: 8px 6px;
                text-align: left;
                vertical-align: top;
              }

              .print-table th {
                background: #f0f0f0;
                font-weight: bold;
                text-align: center;
              }

              .print-table .number-col {
                text-align: center;
                width: 40px;
              }

              .print-table .name-col {
                width: 150px;
              }

              .print-table .dharma-col {
                width: 120px;
              }

              .print-table .age-col {
                width: 80px;
                text-align: center;
              }

              .print-table .sao-col {
                width: 80px;
                text-align: center;
              }

              .print-table .han-col {
                width: 80px;
                text-align: center;
              }

              .print-table .gender-col {
                width: 70px;
                text-align: center;
              }

              .print-table .hometown-col {
                width: 180px;
              }

              .print-footer {
                margin-top: 20px;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
              }

              .head-badge {
                background: #e3f2fd;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                color: #1976d2;
              }
            }
          `}</style>

          {/* Print Content */}
          <div className='print-content'>
            {/* Header */}
            <div className='print-header'>
              <div className='print-title'>
                Danh sách thành viên gia đình - Cúng sao
              </div>

              <div className='print-info'>
                <div>
                  <div className='mb-2'>
                    <span className='font-semibold'>Chủ hộ:</span>{' '}
                    {getHeadOfHousehold()?.full_name || 'Chưa xác định'}
                  </div>
                  <div className='mb-2'>
                    <span className='font-semibold'>Địa chỉ:</span>{' '}
                    {household.address}
                  </div>
                  {household.phone && (
                    <div className='mb-2'>
                      <span className='font-semibold'>Số điện thoại:</span>{' '}
                      {household.phone}
                    </div>
                  )}
                </div>
                <div className='text-right'>
                  <div className='mb-2'>
                    <span className='font-semibold'>Tổng thành viên:</span>{' '}
                    {members.length} người
                  </div>
                  <div className='mb-2'>
                    <span className='font-semibold'>Ngày in:</span>{' '}
                    {formatPrintDate()}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <table className='print-table'>
              <thead>
                <tr>
                  <th className='number-col'>STT</th>
                  <th className='name-col'>Họ và tên</th>
                  <th className='dharma-col'>Pháp danh</th>
                  <th className='age-col'>Tuổi</th>
                  <th className='age-col'>Năm sinh</th>
                  <th className='sao-col'>Sao chiếu mệnh</th>
                  <th className='han-col'>Vận hạn</th>
                  <th className='gender-col'>Giới tính</th>
                  <th className='hometown-col'>Quê quán</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member, index) => (
                  <tr key={member.id}>
                    <td className='number-col'>{index + 1}</td>
                    <td className='name-col'>
                      <div className='font-medium'>{member.full_name}</div>
                      {member.is_head_of_household && (
                        <div className='head-badge mt-1'>Chủ hộ</div>
                      )}
                    </td>
                    <td className='dharma-col'>
                      {member.dharma_name || 'Chưa có'}
                    </td>
                    <td className='age-col'>
                      <div>{calculateAge(member.birth_year)} tuổi</div>
                      <div className='text-xs text-gray-600'>
                        {getCanChi(member.birth_year)}
                      </div>
                    </td>
                    <td className='age-col'>{member.birth_year}</td>
                    <td className='sao-col'>
                      {getSaoChieuMenh(
                        member.birth_year,
                        member.gender as string
                      )}
                    </td>
                    <td className='han-col'>
                      {
                        getVanHan(member.birth_year, member.gender as string)
                          .han
                      }
                    </td>
                    <td className='gender-col'>
                      {GENDER_LABELS[
                        member.gender as keyof typeof GENDER_LABELS
                      ] || member.gender}
                    </td>
                    <td className='hometown-col'>
                      {member.hometown || 'Chưa cập nhật'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className='print-footer'>
              <div>
                <div className='font-semibold'>Ghi chú:</div>
                <div>
                  - Danh sách được sắp xếp theo thứ tự: Chủ hộ, sau đó theo tuổi
                  giảm dần
                </div>
                <div>- Sao chiếu mệnh và vận hạn được tính theo âm lịch</div>
              </div>
              <div>
                <div className='font-semibold'>Người lập danh sách</div>
                <div className='mt-8 border-t border-gray-400 pt-1 text-center'>
                  (Ký tên và đóng dấu)
                </div>
              </div>
            </div>
          </div>

          {/* Preview Content (for screen) */}
          <div className='screen:block mt-4 rounded-lg bg-gray-50 p-6 print:hidden'>
            <div
              className='rounded bg-white p-6 shadow-sm'
              style={{
                minHeight: '29.7cm',
                width: '21cm',
                margin: '0 auto',
                transform: 'scale(0.7)',
                transformOrigin: 'top center'
              }}
            >
              {/* Preview Header */}
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
                    {household.phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4' />
                        <span className='font-semibold'>Số điện thoại:</span>
                        <span>{household.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className='space-y-2 text-right'>
                    <div>
                      <span className='font-semibold'>Tổng thành viên:</span>
                      <Badge variant='secondary' className='ml-2'>
                        {members.length} người
                      </Badge>
                    </div>
                    <div className='flex items-center justify-end gap-2'>
                      <Calendar className='h-4 w-4' />
                      <span className='font-semibold'>Ngày in:</span>
                      <span>{formatPrintDate()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className='overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-800 text-sm'>
                  <thead>
                    <tr className='bg-gray-100'>
                      <th className='w-12 border border-gray-800 p-2 text-center'>
                        STT
                      </th>
                      <th className='w-36 border border-gray-800 p-2 text-center'>
                        Họ và tên
                      </th>
                      <th className='w-28 border border-gray-800 p-2 text-center'>
                        Pháp danh
                      </th>
                      <th className='w-20 border border-gray-800 p-2 text-center'>
                        Tuổi
                      </th>
                      <th className='w-20 border border-gray-800 p-2 text-center'>
                        Năm sinh
                      </th>
                      <th className='w-24 border border-gray-800 p-2 text-center'>
                        Sao chiếu mệnh
                      </th>
                      <th className='w-20 border border-gray-800 p-2 text-center'>
                        Vận hạn
                      </th>
                      <th className='w-16 border border-gray-800 p-2 text-center'>
                        Giới tính
                      </th>
                      <th className='border border-gray-800 p-2 text-center'>
                        Quê quán
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMembers.map((member, index) => (
                      <tr key={member.id} className='hover:bg-gray-50'>
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
                            <span className='text-gray-500 italic'>
                              Chưa có
                            </span>
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
                        <td className='border border-gray-800 p-2 text-center font-mono'>
                          {member.birth_year}
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
                        <td className='border border-gray-800 p-2'>
                          {member.hometown || (
                            <span className='text-gray-500 italic'>
                              Chưa cập nhật
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview Footer */}
              <div className='mt-6 flex items-end justify-between text-sm'>
                <div>
                  <div className='mb-2 font-semibold'>Ghi chú:</div>
                  <div className='space-y-1 text-xs'>
                    <div>
                      - Danh sách được sắp xếp theo thứ tự: Chủ hộ, sau đó theo
                      tuổi giảm dần
                    </div>
                    <div>
                      - Sao chiếu mệnh và vận hạn được tính theo âm lịch
                    </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
