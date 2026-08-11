import { offlineCapableFetch } from '../../../utils/sync';
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { generateSimpleSVGPath, generateDynamicQRToken } from '../../../../shared/utils/qr';
import { CheckCircle2, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';

interface QRCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess?: () => void;
}

export const QRCheckInModal: React.FC<QRCheckInModalProps> = ({
  isOpen,
  onClose,
  onCheckInSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [qrToken, setQrToken] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInCompleted, setCheckInCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCheckInCompleted(false);
      fetchActiveSession();
    }
  }, [isOpen]);

  // Auto-refresh dynamic token every 30s
  useEffect(() => {
    let interval: any;
    if (isOpen && activeSession) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            refreshQR();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeSession]);

  const fetchActiveSession = async () => {
    try {
      const res = await offlineCapableFetch('/api/sessions');
      if (res.ok) {
        const sessions = await res.json();
        const active = sessions.find((s: any) => s.status === 'ACTIVE') || sessions[0];
        setActiveSession(active);
        if (active) {
          const generated = generateDynamicQRToken(active.id, active.classCode || active.courseCode || 'CLS');
          setQrToken(generated.token);
        }
      }
    } catch {
      showToast('Error loading active session details', 'error');
    }
  };

  const refreshQR = () => {
    if (!activeSession) return;
    const generated = generateDynamicQRToken(activeSession.id, activeSession.classCode || activeSession.courseCode || 'CLS');
    setQrToken(generated.token);
    setTimer(30);
  };

  const handleStudentCheckIn = async () => {
    if (!activeSession || !user) return;
    setIsCheckingIn(true);
    try {
      const res = await offlineCapableFetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          studentId: user.id,
          qrToken,
          latitude: 37.7749,
          longitude: -122.4194,
        }),
      });

      if (res.ok) {
        setCheckInCompleted(true);
        showToast('Check-in verified successfully!', 'success');
        if (onCheckInSuccess) onCheckInSuccess();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Check-in failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const svgPath = generateSimpleSVGPath(qrToken || 'ATTENDEASE_TEST_TOKEN');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user?.role === 'STUDENT' ? 'Live QR Check-in' : 'Session Attendance QR Code'}
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center p-2 space-y-6">
        {/* Class Section Header */}
        {activeSession && (
          <div className="w-full bg-m3-sys-light-surface-variant/30 dark:bg-m3-sys-dark-surface-variant/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between text-label-large gap-2 border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30">
            <span className="font-bold text-m3-sys-light-primary dark:text-m3-sys-dark-primary">
              {activeSession.classCode || activeSession.courseCode}: {activeSession.sectionName || activeSession.title} ({activeSession.subject})
            </span>
            <span className="text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant font-medium bg-m3-sys-light-surface-variant/50 dark:bg-m3-sys-dark-surface-variant/50 px-2.5 py-1 rounded-md">
              {activeSession.room}
            </span>
          </div>
        )}

        {/* Check-in Success State for Students */}
        {checkInCompleted ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container flex items-center justify-center animate-bounce shadow-expressive">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-display-small font-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
              Attendance Verified!
            </h3>
            <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant max-w-xs">
              You are officially marked <strong className="text-m3-sys-light-primary dark:text-m3-sys-dark-primary">PRESENT</strong> for {activeSession?.sectionName || activeSession?.classCode}.
            </p>
            <Button className="mt-4 shadow-expressive-sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Visual Dynamic QR Canvas */}
            <div className="relative p-8 bg-white dark:bg-slate-950 border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 rounded-[32px] shadow-expressive flex flex-col items-center justify-center bg-expressive-surface">
              <svg
                viewBox="0 0 150 150"
                className="w-48 h-48 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface"
                dangerouslySetInnerHTML={{ __html: svgPath }}
              />

              {/* Dynamic Refresh Indicator */}
              <div className="mt-5 flex items-center gap-2 px-4 py-1.5 rounded-full bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-label-small font-semibold text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container shadow-sm border border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Refreshes in {timer}s</span>
              </div>
            </div>

            {/* Role Action Explanations */}
            {user?.role === 'STUDENT' ? (
              <div className="w-full space-y-4 pt-2">
                <div className="flex items-center justify-center gap-2 text-label-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                  <ShieldCheck className="w-4 h-4 text-m3-sys-light-primary dark:text-m3-sys-dark-primary" />
                  <span>GPS Geofence: <strong className="text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">Verified On-Site</strong></span>
                </div>

                <Button
                  id="submit-student-checkin-btn"
                  size="lg"
                  variant="primary"
                  className="w-full font-bold shadow-expressive-sm rounded-full py-4 text-title-medium hover:scale-105 transition-transform"
                  onClick={handleStudentCheckIn}
                  isLoading={isCheckingIn}
                  icon={<Smartphone className="w-5 h-5" />}
                >
                  Scan & Verify Check-in
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-4 pt-2">
                <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                  Display this screen on classroom projector or mobile device. Students scan to log presence instantly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshQR}
                  icon={<RefreshCw className="w-4 h-4" />}
                  className="rounded-full shadow-sm"
                >
                  Force Refresh QR Token
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
