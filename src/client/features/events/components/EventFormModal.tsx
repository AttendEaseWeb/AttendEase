import React, { useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { useNotification } from '../../../context/NotificationContext';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [schedule, setSchedule] = useState('Mon / Wed / Fri • 10:00 AM');
  const [room, setRoom] = useState('Engineering Lab 301');
  const [totalStudents, setTotalStudents] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title) {
      showToast('Course code and title are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          title,
          description,
          instructorId: 'u-inst-1',
          instructorName: 'Prof. Alexander Wright',
          department,
          schedule,
          room,
          totalStudents: parseInt(totalStudents, 10) || 30,
          color: 'indigo',
        }),
      });

      if (res.ok) {
        showToast('New course created successfully!', 'success');
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create course');
      }
    } catch {
      showToast('Error creating course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Course">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Course Code"
            placeholder="e.g. CS 301"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Input
            label="Department"
            placeholder="e.g. Computer Science"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <Input
          label="Course Title"
          placeholder="e.g. Software Architecture & Engineering"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface ml-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface p-4 text-body-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary transition-shadow shadow-sm"
            placeholder="Brief overview of course syllabus..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Schedule"
            placeholder="e.g. Mon / Wed 10:00 AM"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <Input
            label="Room Location"
            placeholder="e.g. Lab 402"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </div>

        <Input
          label="Total Enrolled Students"
          type="number"
          value={totalStudents}
          onChange={(e) => setTotalStudents(e.target.value)}
        />

        <div className="pt-5 flex justify-end gap-3 border-t border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="primary">
            Create Course
          </Button>
        </div>
      </form>
    </Modal>
  );
};
