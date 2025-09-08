'use client';
import { TableCell } from '@/components/ui/table';
import {
  Gender,
  getGenderLabel
} from '@/features/family-members/schemas/family-member-schema';
import { getCanChi, getSaoChieuMenh, getTuoi, getVanHan } from '@/lib/utils';
import { FamilyMember } from '@/types/database';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
const ReadOnlyMemberRow = ({
  member,
  onEdit,
  onDelete,
  onViewDetail
}: {
  member: FamilyMember;
  onEdit: () => void;
  onDelete: (name: string) => void;
  onViewDetail: () => void;
}) => {
  return (
    <>
      <TableCell className='font-medium'>
        <div className='flex items-center space-x-2'>
          <span>{member.full_name}</span>
          {member.is_head_of_household && (
            <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
              Chủ hộ
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>{member?.phap_danh || '-'}</TableCell>
      <TableCell width={50}>
        {getTuoi(member.birth_year)} ({getCanChi(member.birth_year)})
      </TableCell>
      <TableCell>{getSaoChieuMenh(member.birth_year, member.gender)}</TableCell>
      <TableCell>{getVanHan(member.birth_year, member.gender).han}</TableCell>
      <TableCell>
        <Badge variant='outline'>
          {getGenderLabel(member.gender as Gender)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant='secondary'
          className={
            member?.is_alive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {member?.is_alive ? 'Còn sống' : 'Đã mất'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className='flex space-x-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={onViewDetail}
            className='hover:bg-blue-50'
            title='Xem chi tiết'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button size='sm' variant='outline' onClick={onEdit}>
            <Edit2 className='h-4 w-4' />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='text-red-600 hover:text-red-700'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa thành viên "{member.full_name}"?
                  Thao tác này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(member.full_name)}
                  className='bg-red-600 hover:bg-red-700'
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </>
  );
};

export default ReadOnlyMemberRow;
