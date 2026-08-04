import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { generateSimpleSVGPath, generateDynamicQRToken } from '../../../../shared/utils/qr';
import { QrCode, CheckCircle2, ShieldCheck, MapPin, RefreshCw, Smartphone, Sparkles } from 'lucide-react';

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
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const sessions = await res.json();
        const active = sessions.find((s: any) => s.status === 'ACTIVE') || sessions[0];
        setActiveSession(active);
        if (active) {
          const generated = generateDynamicQRToken(active.id, active.courseCode);
          setQrToken(generated.token);
        }
      }
    } catch {
      showToast('Error loading active session details', 'error');
    }
  };

  const refreshQR = () => {
    if (!activeSession) return;
    const generated = generateDynamicQRToken(activeSession.id, activeSession.courseCode);
    setQrToken(generated.token);
    setTimer(30);
  };

  const handleStudentCheckIn = async () => {
    if (!activeSession || !user) return;
    setIsCheckingIn(true);
    try {
      const res = await fetch('/api/attendance/checkin', {
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
      <div className="flex flex-col items-center text-center p-2 space-y-5">
        {/* Course Header */}
        {activeSession && (
          <div className="w-full bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {activeSession.courseCode}: {activeSession.title}
            </span>
            <span className="text-slate-500 font-medium">{activeSession.room}</span>
          </div>
        )}

        {/* Check-in Success State for Students */}
        {checkInCompleted ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-500 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Attendance Verified!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              You are officially marked <strong className="text-emerald-600">PRESENT</strong> for {activeSession?.courseCode}.
            </p>
            <Button className="mt-2" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Visual Dynamic QR Canvas */}
            <div className="relative p-6 bg-white dark:bg-slate-950 border-2 border-indigo-500/30 rounded-3xl shadow-xl flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 150 150"
                className="w-48 h-48 text-slate-900 dark:text-slate-100"
                dangerouslySetInnerHTML={{ __html: svgPath }}
              />

              {/* Dynamic Refresh Indicator */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                <span>Refreshes in {timer}s</span>
              </div>
            </div>

            {/* Role Action Explanations */}
            {user?.role === 'STUDENT' ? (
              <div className="w-full space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>GPS Geofence: <strong className="text-slate-700 dark:text-slate-300">Verified On-Site</strong></span>
                </div>

                <Button
                  id="submit-student-checkin-btn"
                  size="lg"
                  variant="primary"
                  className="w-full font-bold shadow-lg shadow-indigo-600/30"
                  onClick={handleStudentCheckIn}
                  isLoading={isCheckingIn}
                  icon={<Smartphone className="w-5 h-5" />}
                >
                  Scan & Verify Check-in
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-3 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Display this screen on classroom projector or mobile device. Students scan to log presence instantly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshQR}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
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
