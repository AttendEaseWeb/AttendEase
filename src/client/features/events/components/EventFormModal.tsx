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
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Course
          </Button>
        </div>
      </form>
    </Modal>
  );
};
