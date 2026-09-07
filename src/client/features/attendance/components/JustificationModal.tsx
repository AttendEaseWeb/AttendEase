import React, { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { useAuth } from "../../../context/AuthContext";
import { AttendanceRecord } from "../../../../shared/types/attendance";
import { offlineCapableFetch } from "../../../utils/sync";
import { useNotification } from "../../../context/NotificationContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  onSuccess: () => void;
}

export const JustificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!record || !user) return null;

  const isStudent = user.role === "STUDENT";
  const hasPending = record.justificationStatus === "PENDING";
  const isResolved = record.justificationStatus === "APPROVED" || record.justificationStatus === "REJECTED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      showToast("Please provide a reason", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await offlineCapableFetch("/api/attendance/justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id, justification }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      showToast("Justification submitted successfully", "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast("Error submitting justification", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (status: "APPROVED" | "REJECTED") => {
    setIsSubmitting(true);
    try {
      const res = await offlineCapableFetch("/api/attendance/justification/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id, status }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      showToast(`Justification ${status.toLowerCase()}`, "success");
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast("Error resolving justification", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isStudent ? "Submit Absence Justification" : "Review Justification"}
      size="md"
    >
      <div className="space-y-4">
        <div className="p-3 bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 rounded-xl">
          <p className="text-body-medium font-bold">{record.subject} ({record.sectionName})</p>
          <p className="text-body-small opacity-70">{new Date(record.checkInTime).toLocaleString()}</p>
          {!isStudent && (
            <p className="text-body-small font-bold mt-2 text-m3-sys-light-primary dark:text-m3-sys-dark-primary">
              Student: {record.studentName}
            </p>
          )}
        </div>

        {isStudent && !hasPending && !isResolved && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Reason for Absence"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="E.g., Medical emergency, family matter..."
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
            </div>
          </form>
        )}

        {(hasPending || isResolved) && (
          <div className="space-y-4">
            <div>
              <p className="text-label-small uppercase tracking-wider opacity-70 mb-1">Submitted Reason</p>
              <div className="p-3 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-xl">
                {record.justification}
              </div>
            </div>

            <div>
              <p className="text-label-small uppercase tracking-wider opacity-70 mb-1">Status</p>
              <p className={`font-bold ${record.justificationStatus === 'APPROVED' ? 'text-emerald-500' : record.justificationStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'}`}>
                {record.justificationStatus}
              </p>
            </div>

            {!isStudent && hasPending && (
              <div className="flex justify-end gap-2 pt-4 border-t border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30">
                <Button variant="outline" onClick={() => handleResolve("REJECTED")} disabled={isSubmitting} className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10">Reject</Button>
                <Button variant="primary" onClick={() => handleResolve("APPROVED")} disabled={isSubmitting}>Approve as Excused</Button>
              </div>
            )}
            
            {(isStudent || isResolved) && (
               <div className="flex justify-end pt-2">
                 <Button variant="outline" onClick={onClose}>Close</Button>
               </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
