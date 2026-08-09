import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { UserRole } from '../../../../shared/types/auth';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { CheckCircle2, Shield, UserCheck, GraduationCap, Lock, Mail, User as UserIcon, Building2, Key, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useNotification();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<UserRole>('STUDENT');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [studentId, setStudentId] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleQuickLogin = async (testEmail: string, testRole: UserRole) => {
    setIsLoading(true);
    try {
      await login({ email: testEmail, password: 'password123', role: testRole });
      showToast(`Logged in successfully as ${testRole}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'LOGIN') {
        await login({ email, password, role });
        showToast('Welcome back to AttendEase!', 'success');
      } else {
        if (!name) {
          showToast('Please enter your full name', 'error');
          setIsLoading(false);
          return;
        }
        await register({
          name,
          email,
          password,
          role,
          department,
          studentId: role === 'STUDENT' ? studentId || `ST-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        });
        showToast('Account created successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-m3-sys-light-background dark:bg-m3-sys-dark-background text-m3-sys-light-on-background dark:text-m3-sys-dark-on-background flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Background Decorative Blur Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container rounded-full blur-[100px] pointer-events-none opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-m3-sys-light-tertiary-container dark:bg-m3-sys-dark-tertiary-container rounded-full blur-[100px] pointer-events-none opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container rounded-full blur-[120px] pointer-events-none opacity-30 dark:opacity-20" />

      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container text-label-small shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>AttendEase Portal v1.0</span>
          </div>
          <h1 className="text-display-small font-medium tracking-tight text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-2">
            {mode === 'LOGIN' ? 'Sign In to Your Account' : 'Create New Account'}
          </h1>
          <p className="text-body-large text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant max-w-xs mx-auto leading-relaxed">
            Dynamic QR verification, session attendance management, and real-time student logs.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-expressive-surface p-1.5 rounded-full shadow-sm">
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-2.5 rounded-full text-label-large transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary shadow-expressive-sm scale-[1.02]'
                : 'text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:text-m3-sys-light-on-surface dark:hover:text-m3-sys-dark-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-2.5 rounded-full text-label-large transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary shadow-expressive-sm scale-[1.02]'
                : 'text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:text-m3-sys-light-on-surface dark:hover:text-m3-sys-dark-on-surface'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Quick Test Accounts Banner */}
        <div className="p-4 rounded-[28px] bg-expressive-surface border border-m3-sys-light-outline-variant/50 dark:border-m3-sys-dark-outline-variant/50 space-y-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-label-small text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant uppercase tracking-wider">
            <Key className="w-3.5 h-3.5" />
            <span>1-Click Test Login</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => handleQuickLogin('student.test@attendease.edu', 'STUDENT')}
              className="px-2 py-3 rounded-[20px] bg-m3-sys-light-secondary-container dark:bg-m3-sys-dark-secondary-container text-label-medium text-m3-sys-light-on-secondary-container dark:text-m3-sys-dark-on-secondary-container transition-colors text-center truncate cursor-pointer flex flex-col items-center gap-2 shadow-sm"
            >
              <GraduationCap className="w-5 h-5" />
              <span className="truncate">Student</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => handleQuickLogin('instructor.test@attendease.edu', 'INSTRUCTOR')}
              className="px-2 py-3 rounded-[20px] bg-m3-sys-light-tertiary-container dark:bg-m3-sys-dark-tertiary-container text-label-medium text-m3-sys-light-on-tertiary-container dark:text-m3-sys-dark-on-tertiary-container transition-colors text-center truncate cursor-pointer flex flex-col items-center gap-2 shadow-sm"
            >
              <UserCheck className="w-5 h-5" />
              <span className="truncate">Instructor</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => handleQuickLogin('admin.test@attendease.edu', 'ADMIN')}
              className="px-2 py-3 rounded-[20px] bg-m3-sys-light-error-container dark:bg-m3-sys-dark-error-container text-label-medium text-m3-sys-light-on-error-container dark:text-m3-sys-dark-on-error-container transition-colors text-center truncate cursor-pointer flex flex-col items-center gap-2 shadow-sm"
            >
              <Shield className="w-5 h-5" />
              <span className="truncate">Admin</span>
            </motion.button>
          </div>
        </div>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-[36px] bg-expressive-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 shadow-expressive space-y-6">
          {/* Role Picker */}
          <div className="space-y-2">
            <label className="text-label-medium text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-2 rounded-2xl text-label-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container border-m3-sys-light-primary dark:border-m3-sys-dark-primary text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container'
                    : 'bg-transparent border-m3-sys-light-outline dark:border-m3-sys-dark-outline text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/30 dark:hover:bg-m3-sys-dark-surface-variant/30'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('INSTRUCTOR')}
                className={`p-2 rounded-2xl text-label-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  role === 'INSTRUCTOR'
                    ? 'bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container border-m3-sys-light-primary dark:border-m3-sys-dark-primary text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container'
                    : 'bg-transparent border-m3-sys-light-outline dark:border-m3-sys-dark-outline text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/30 dark:hover:bg-m3-sys-dark-surface-variant/30'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>Instructor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`p-2 rounded-2xl text-label-medium flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-m3-sys-light-primary-container dark:bg-m3-sys-dark-primary-container border-m3-sys-light-primary dark:border-m3-sys-dark-primary text-m3-sys-light-on-primary-container dark:text-m3-sys-dark-on-primary-container'
                    : 'bg-transparent border-m3-sys-light-outline dark:border-m3-sys-dark-outline text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant hover:bg-m3-sys-light-surface-variant/30 dark:hover:bg-m3-sys-dark-surface-variant/30'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {mode === 'REGISTER' && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<UserIcon className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Department"
                  placeholder="Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  icon={<Building2 className="w-4 h-4 text-slate-400" />}
                />
                {role === 'STUDENT' && (
                  <Input
                    label="Student ID (Optional)"
                    placeholder="ST-2026-1234"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                )}
              </div>
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@attendease.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-4 text-label-large bg-m3-sys-light-primary dark:bg-m3-sys-dark-primary hover:bg-m3-sys-light-primary/90 text-m3-sys-light-on-primary dark:text-m3-sys-dark-on-primary rounded-full shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            <span>{mode === 'LOGIN' ? 'Sign In to Portal' : 'Create AttendEase Account'}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        {/* Footer info */}
        <p className="text-body-small text-center text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
          AttendEase &copy; 2026. Secure attendance management system.
        </p>
      </div>
    </div>
  );
};
