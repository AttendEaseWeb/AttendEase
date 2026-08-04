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
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            User Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

      <Card title="User Roster" subtitle="Manage account roles and permissions">
        <UserTable users={users} />
      </Card>
    </div>
  );
};
