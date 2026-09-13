import React from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { ExcuseRequest } from "../../../../shared/types/attendance";

interface ViewExcuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  excuse: ExcuseRequest | null;
}

export const ViewExcuseModal: React.FC<ViewExcuseModalProps> = ({
  isOpen,
  onClose,
  excuse,
}) => {
  if (!excuse) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Excuse Request: ${excuse.studentName}`}>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-500">Date of Absence</h4>
          <p>{excuse.dateOfAbsence}</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-500">Reason</h4>
          <p className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-md mt-1">{excuse.reason}</p>
        </div>
        {excuse.evidenceDataUrl && (
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-2">Evidence Photo</h4>
            <img src={excuse.evidenceDataUrl} alt="Excuse Evidence" className="max-w-full rounded-md border" />
          </div>
        )}
        <div className="pt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};
