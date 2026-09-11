import { offlineCapableFetch } from "../../../utils/sync";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { User } from "../../../../shared/types/auth";
import { UserTable } from "../components/UserTable";
import { AddUserModal } from "../components/AddUserModal";
import { Card } from "../../../components/common/Card";
import { useNotification } from "../../../context/NotificationContext";
import { RefreshCw, UserPlus, Users } from "lucide-react";
import { Button } from "../../../components/common/Button";

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
      const res = await offlineCapableFetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch {
      showToast("Error loading user directory", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-fuchsia-500/10 border border-m3-sys-light-outline-variant/30 dark:border-m3-sys-dark-outline-variant/30 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="p-3.5 bg-m3-sys-light-surface dark:bg-m3-sys-dark-surface rounded-2xl shadow-sm border border-m3-sys-light-outline-variant/20 flex-shrink-0">
               <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-headline-medium font-bold text-m3-sys-light-on-surface dark:text-m3-sys-dark-on-surface tracking-tight">
                User Directory
              </h2>
              <p className="text-body-large text-m3-sys-light-on-surface-variant dark:text-m3-sys-dark-on-surface-variant mt-2 max-w-2xl leading-relaxed">
                Registered students, course instructors, and administrative accounts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
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
              onClick={() => setIsAddUserOpen(true)}
              icon={<UserPlus className="w-4 h-4" />}
              className="rounded-full shadow-expressive-sm"
            >
              Add Student Account
            </Button>
          </div>
        </div>
      </div>

      <Card
        title="User Roster"
        subtitle="Manage system accounts and student details"
      >
        <UserTable users={users} onUserDeleted={fetchUsers} />
      </Card>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={fetchUsers}
      />
    </motion.div>
  );
};
