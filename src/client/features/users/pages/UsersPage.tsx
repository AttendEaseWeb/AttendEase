import React, { useEffect, useState } from 'react';
import { User } from '../../../../shared/types/auth';
import { UserTable } from '../components/UserTable';
import { Card } from '../../../components/common/Card';
import { useNotification } from '../../../context/NotificationContext';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../../components/common/Button';

export const UsersPage: React.FC = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
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
          <h2 className="text-headline-small text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
            User Directory
          </h2>
          <p className="text-body-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-1">
            Registered students, course instructors, and administrative accounts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Directory
        </Button>
      </div>

      {/* Directory Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-expressive-surface border border-m3-sys-light-outline-variant/30 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-m3-sys-light-on-surface-variant">Total Accounts</div>
          <div className="text-title-large font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface mt-1">{users.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-rose-700 dark:text-rose-400">Administrators</div>
          <div className="text-title-large font-bold text-rose-800 dark:text-rose-300 mt-1">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-indigo-700 dark:text-indigo-400">Instructors</div>
          <div className="text-title-large font-bold text-indigo-800 dark:text-indigo-300 mt-1">
            {users.filter((u) => u.role === 'INSTRUCTOR').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-expressive-sm">
          <div className="text-label-small font-semibold text-emerald-700 dark:text-emerald-400">Enrolled Students</div>
          <div className="text-title-large font-bold text-emerald-800 dark:text-emerald-300 mt-1">
            {users.filter((u) => u.role === 'STUDENT').length}
          </div>
        </div>
      </div>

      <Card title="User Roster" subtitle="Manage account roles and permissions">
        <UserTable users={users} />
      </Card>
    </div>
  );
};
