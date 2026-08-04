import React, { useState } from 'react';
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Background Decorative Blur Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>AttendEase Portal v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'LOGIN' ? 'Sign In to Your Account' : 'Create New Account'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Dynamic QR verification, session attendance management, and real-time student logs.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Quick Test Accounts Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Temporary Test Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('test.student@attendease.edu', 'STUDENT')}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-200 transition-all text-center truncate cursor-pointer flex flex-col items-center gap-0.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate">Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('test.instructor@attendease.edu', 'INSTRUCTOR')}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-200 transition-all text-center truncate cursor-pointer flex flex-col items-center gap-0.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate">Instructor</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('test.admin@attendease.edu', 'ADMIN')}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-200 transition-all text-center truncate cursor-pointer flex flex-col items-center gap-0.5"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span className="truncate">Admin</span>
            </button>
          </div>
        </div>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          {/* Role Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Account Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('INSTRUCTOR')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  role === 'INSTRUCTOR'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Instructor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
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
            className="w-full py-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'LOGIN' ? 'Sign In to Portal' : 'Create AttendEase Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500">
          AttendEase &copy; 2026. Secure attendance management system.
        </p>
      </div>
    </div>
  );
};
