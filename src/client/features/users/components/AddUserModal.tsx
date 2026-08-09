import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { ClassSection } from '../../../../shared/types/class';
import { useNotification } from '../../../context/NotificationContext';
import {
  UserPlus,
  Phone,
  User as UserIcon,
  IdCard,
  GraduationCap,
} from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  defaultClassId?: string;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
  defaultClassId,
}) => {
  const { showToast } = useNotification();

  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId || '');

  const [availableClasses, setAvailableClasses] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setParentPhone('');
      setStudentId(`2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setSelectedClassId(defaultClassId || '');
      fetchClasses();
    }
  }, [isOpen, defaultClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        setAvailableClasses(await res.json());
      }
    } catch {
      console.error('Failed to load class sections');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide Full Name', 'error');
      return;
    }

    if (!parentPhone.trim()) {
      showToast("Please provide Parent/Guardian's phone number", 'error');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Student Account
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          parentPhone: parentPhone.trim(),
          role: 'STUDENT',
          studentId: studentId.trim(),
          avatarUrl: DEFAULT_AVATAR,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create student account');
      }

      const createdUser = await res.json();

      // 2. If a Class Section was selected for enrollment, add student to section
      if (selectedClassId) {
        const clsRes = await fetch(`/api/classes/${selectedClassId}`);
        if (clsRes.ok) {
          const classData: ClassSection = await clsRes.json();
          const currentEnrolled = classData.enrolledStudentIds || [];
          if (!currentEnrolled.includes(createdUser.id)) {
            const updatedEnrolled = [...currentEnrolled, createdUser.id];
            await fetch(`/api/classes/${selectedClassId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                enrolledStudentIds: updatedEnrolled,
              }),
            });
          }
        }
      }

      showToast(`Successfully created student account for "${name}"!`, 'success');
      onUserAdded();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error creating user', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Student Account"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-3 pb-1">
        
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-label-medium font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-m3-sys-light-primary" />
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Juan De La Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-m3-sys-light-outline-variant/60 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-medium font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-m3-sys-light-primary" />
              Parent/Guardian Phone
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 09171234567"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-m3-sys-light-outline-variant/60 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            />
          </div>
        </div>

        {/* Academic Details */}
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-label-medium font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-m3-sys-light-primary" />
              LRN / Student ID Number
            </label>
            <input
              type="text"
              placeholder="e.g. 2026-10492"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-m3-sys-light-outline-variant/60 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary font-mono shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-medium font-semibold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-m3-sys-light-primary" />
              Class Section (Optional)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-m3-sys-light-outline-variant/60 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface text-body-medium text-m3-sys-light-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-sm"
            >
              <option value="">-- No Initial Assignment --</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Grade {cls.gradeLevel} - {cls.sectionName} ({cls.strand || cls.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 mt-2 flex items-center justify-end gap-3 border-t border-m3-sys-light-outline-variant/30">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={<UserPlus className="w-4 h-4" />}
            className="rounded-full shadow-expressive-sm"
          >
            Create Student Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

