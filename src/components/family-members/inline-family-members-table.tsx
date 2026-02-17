'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { deleteFamilyMember } from '@/features/family-members/actions/family-member-actions';
import {
  Gender,
  GENDER_LABELS
} from '@/features/family-members/schemas/family-member-schema';
import { useToast } from '@/hooks/use-toast';
import { useHouseholdDrawer } from '@/hooks/use-household-drawer';
import { getCanChi, getSaoChieuMenh, getVanHan } from '@/lib/utils';
import type { FamilyMember } from '@/types/database';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import FamilyMemberForm from './family-member-form';
import { MemberDetailDrawer } from './member-detail-drawer';
import { MemberSearchModal } from './member-search-modal';

interface InlineFamilyMembersTableProps {
  members: FamilyMember[];
  householdId: string;
}

export function InlineFamilyMembersTable({
  members,
  householdId
}: InlineFamilyMembersTableProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(members);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(
    null
  );
  const [isFormSubmitting] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { openHousehold } = useHouseholdDrawer();
  const { toast } = useToast();

  // Calculate age from birth year
  const calculateAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear + 1;
  };

  // Open modal for adding new member
  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing member
  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  // Handle form success (both create and update)
  const handleFormSuccess = (member: FamilyMember) => {
    if (editingMember) {
      // Update existing member
      setFamilyMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? member : m))
      );
    } else {
      // Add new member
      setFamilyMembers((prev) => [...prev, member]);
    }
    closeModal();
  };

  // Handle delete member
  const handleDeleteMember = (member: FamilyMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      await deleteFamilyMember(memberToDelete.id, householdId);
      setFamilyMembers((prev) =>
        prev.filter((member) => member.id !== memberToDelete.id)
      );

      toast({
        title: 'Thành công',
        description: `Đã xóa thành viên ${memberToDelete.full_name}`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra'
      });
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  // Open member detail drawer
  const handleViewDetail = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsDrawerOpen(true);
  };

  // Update member from drawer
  const updateMemberFromDrawer = (updatedMember: FamilyMember) => {
    setFamilyMembers((prev) =>
      prev.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
  };

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Danh sách thành viên</h3>
          <p className='text-muted-foreground text-sm'>
            Quản lý thông tin các thành viên trong gia đình
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={handleAddMember}
            className='cursor-pointer bg-[#00B14F] hover:bg-[#009643]'
          >
            <Plus className='mr-2 h-4 w-4' />
            Thêm thành viên
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[200px]'>Họ tên</TableHead>
              <TableHead className='w-[120px]'>Pháp danh</TableHead>
              <TableHead className='w-[80px]'>Tuổi</TableHead>
              <TableHead className='w-[80px]'>Sao</TableHead>
              <TableHead className='w-[80px]'>Hạn</TableHead>
              <TableHead className='w-[100px]'>Giới tính</TableHead>
              <TableHead className='w-[140px] text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {familyMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='py-12 text-center'>
                  <div className='flex flex-col items-center space-y-4'>
                    <div className='bg-muted rounded-full p-4'>
                      <Plus className='text-muted-foreground h-6 w-6' />
                    </div>
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>
                        Chưa có thành viên nào
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Thêm thành viên đầu tiên để bắt đầu
                      </p>
                    </div>
                    <Button
                      onClick={handleAddMember}
                      size='sm'
                      className='cursor-pointer bg-[#00B14F] hover:bg-[#009643]'
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Thêm thành viên
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              familyMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className='group cursor-pointer transition-colors duration-150 hover:bg-gray-50'
                >
                  <TableCell className='font-medium'>
                    <div className='flex items-center space-x-2'>
                      <span>{member.full_name}</span>
                      {member.is_head_of_household && (
                        <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'>
                          Chủ hộ
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {member.dharma_name || (
                      <span className='text-gray-400 italic'>Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium'>
                        {calculateAge(member.birth_year)} tuổi
                      </span>
                      <span className='text-muted-foreground text-xs'>
                        {getCanChi(member.birth_year)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm font-medium text-amber-700'>
                      {getSaoChieuMenh(
                        member.birth_year,
                        member.gender as string
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm font-medium text-purple-700'>
                      {
                        getVanHan(member.birth_year, member.gender as string)
                          .han
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600'>
                      {GENDER_LABELS[member.gender as Gender] || member.gender}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center space-x-1'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleViewDetail(member)}
                        title='Xem chi tiết'
                        className='h-8 w-8 cursor-pointer p-0 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleEditMember(member)}
                        title='Chỉnh sửa'
                        className='h-8 w-8 cursor-pointer p-0 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDeleteMember(member)}
                        title='Xóa'
                        className='h-8 w-8 cursor-pointer p-0 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      {familyMembers.length > 0 && (
        <div className='text-muted-foreground text-sm'>
          Tổng cộng: <span className='font-medium'>{familyMembers.length}</span>{' '}
          thành viên
        </div>
      )}

      {/* Add/Edit Member Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
            </DialogTitle>
          </DialogHeader>

          <FamilyMemberForm
            member={editingMember}
            householdId={householdId}
            onSuccess={handleFormSuccess}
            onCancel={closeModal}
            isSubmitting={isFormSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thành viên{' '}
              <span className='font-semibold'>{memberToDelete?.full_name}</span>
              ?
              <br />
              <span className='text-red-600'>
                Hành động này không thể hoàn tác.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-500 hover:bg-red-600'
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={updateMemberFromDrawer}
      />

      {/* Member Search Modal */}
      <MemberSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectMember={(member) => {
          openHousehold(member.household_id);
          toast({
            title: 'Đã chọn thành viên',
            description: `${member.full_name} - ${member.household_address || 'Không có địa chỉ'}`
          });
        }}
      />
    </div>
  );
}
