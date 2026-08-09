import React, { useState } from 'react';
import { User } from '../../../../shared/types/auth';
import { Badge } from '../../../components/common/Badge';
import { Search, Trash2 } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

interface UserTableProps {
  users: User[];
  onUserDeleted?: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onUserDeleted }) => {
  const { showToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Are you sure you want to delete account "${u.name}" (${u.email})?`)) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      showToast(`Deleted account for ${u.name}`, 'success');
      if (onUserDeleted) onUserDeleted();
    } catch (err: any) {
      showToast(err.message || 'Error deleting account', 'error');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.parentPhone && u.parentPhone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-body-medium bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface placeholder-m3-sys-light-on-surface-variant dark:placeholder-m3-sys-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-expressive-sm transition-shadow"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-body-medium bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 rounded-full px-4 py-2 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface focus:outline-none focus:ring-2 focus:ring-m3-sys-light-primary shadow-expressive-sm transition-shadow appearance-none pr-8 bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%2349454f%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%23cac4d0%22%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-8px)_center] bg-[length:24px_24px]"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface shadow-expressive-sm">
        <table className="w-full text-left text-body-medium border-collapse">
          <thead>
            <tr className="bg-m3-sys-light-surface-variant/40 dark:bg-m3-sys-dark-surface-variant/40 text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant border-b border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 font-semibold">
              <th className="p-4 pl-6">Student / Account Details</th>
              <th className="p-4">LRN / Code</th>
              <th className="p-4">Account Type</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-m3-sys-light-outline-variant/20 dark:divide-m3-sys-dark-outline-variant/20 text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface">
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-m3-sys-light-surface-variant/20 dark:hover:bg-m3-sys-dark-surface-variant/20 transition-colors"
              >
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-m3-sys-light-outline-variant/20 dark:border-m3-sys-dark-outline-variant/20 shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface text-body-large">{u.name}</span>
                      <span className="text-label-medium text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">
                        {u.parentPhone ? `Phone: ${u.parentPhone}` : u.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant">{u.studentId || u.id}</td>
                <td className="p-4">
                  <Badge
                    variant={
                      u.role === 'ADMIN'
                        ? 'rose'
                        : u.role === 'INSTRUCTOR'
                        ? 'indigo'
                        : 'emerald'
                    }
                  >
                    {u.role === 'STUDENT' ? 'Student' : u.role === 'INSTRUCTOR' ? 'Instructor' : 'Admin'}
                  </Badge>
                </td>
                <td className="p-4 pr-6 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    className="p-2 rounded-full hover:bg-red-500/10 text-m3-sys-light-on-surface-variant hover:text-red-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
