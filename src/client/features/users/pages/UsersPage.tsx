import { offlineCapableFetch } from '../../../utils/sync';
import React, { useEffect, useState } from 'react';
import { User } from '../../../../shared/types/auth';
import { UserTable } from '../components/UserTable';
import { AddUserModal } from '../components/AddUserModal';
import { Card } from '../../../components/common/Card';
import { useNotification } from '../../../context/NotificationContext';
import { RefreshCw, UserPlus } from 'lucide-react';
import { Button } from '../../../components/common/Button';

export const UsersPage: React.FC = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await offlineCapableFetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch {
      showToast('Error loading user directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-small text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface font-semibold">
            User Directory
          </h2>
          <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1">
            Registered students, course instructors, and administrative accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
            className="rounded-full shadow-expressive-sm"
          >
            Add Student Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-m3-sys-light-primary-container text-m3-sys-light-on-primary-container">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
             <div className="text-title-medium font-bold text-m3-sys-light-on-surface">{users.length}</div>
             <div className="text-label-small text-m3-sys-light-on-surface-variant">Total Accounts</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface">{users.filter((u) => u.role === 'STUDENT').length}</div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Students</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface">{users.filter((u) => u.role === 'INSTRUCTOR').length}</div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Instructors</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-title-medium font-bold text-m3-sys-light-on-surface">{users.filter((u) => u.role === 'ADMIN').length}</div>
            <div className="text-label-small text-m3-sys-light-on-surface-variant">Admins</div>
          </div>
        </div>
      </div>

      <Card title="User Roster" subtitle="Manage system accounts and student details">
        <UserTable users={users} onUserDeleted={fetchUsers} />
      </Card>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={fetchUsers}
      />
    </div>
  );
};
