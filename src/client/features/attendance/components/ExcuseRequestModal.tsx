import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";
import { offlineCapableFetch } from "../../../utils/sync";
import { ClassSection } from "../../../../shared/types/class";

interface ExcuseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcuseRequestModal: React.FC<ExcuseRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [reason, setReason] = useState("");
  const [dateOfAbsence, setDateOfAbsence] = useState(new Date().toISOString().split("T")[0]);
  const [photoBase64, setPhotoBase64] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user?.role === "STUDENT") {
      fetchStudentClasses();
    }
  }, [isOpen, user]);

  const fetchStudentClasses = async () => {
    try {
      const res = await offlineCapableFetch("/api/classes");
      if (res.ok) {
        const all: ClassSection[] = await res.json();
        const enrolled = all.filter(c => c.enrolledStudentIds?.includes(user!.id));
        setClasses(enrolled);
        if (enrolled.length > 0) {
          setSelectedClassId(enrolled[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !reason || !dateOfAbsence) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;

    setIsSubmitting(true);
    try {
      const res = await offlineCapableFetch("/api/excuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id,
          studentName: user?.name,
          classId: selectedClass.id,
          className: selectedClass.sectionName,
          instructorId: selectedClass.instructorId,
          reason,
          dateOfAbsence,
          evidenceDataUrl: photoBase64
        })
      });

      if (res.ok) {
        showToast("Excuse request submitted successfully", "success");
        onClose();
      } else {
        showToast("Failed to submit excuse", "error");
      }
    } catch (err) {
      showToast("Network error submitting request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Excuse Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-md border p-2"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.sectionName}</option>
            ))}
          </select>
        </div>
        
        <Input
          label="Date of Absence"
          type="date"
          value={dateOfAbsence}
          onChange={(e) => setDateOfAbsence(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea
            className="w-full rounded-md border p-2 h-24"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Please detail your reason for absence..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Evidence Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-50 file:text-emerald-700
              hover:file:bg-emerald-100"
          />
          {photoBase64 && (
            <div className="mt-2 text-sm text-green-600">Photo attached successfully. Note: Attached photos are automatically deleted from records at the end of the day.</div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>Submit Request</Button>
        </div>
      </form>
    </Modal>
  );
};
