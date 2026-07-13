// Credit Book — Admin: Users Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api';
import { formatRelative, formatPhone } from '../../utils';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Avatar, Dialog, LoadingScreen, EmptyState, Spinner } from '../../components/ui/Components';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll({ status: 'active' }),
    select: (d) => d?.data,
  });

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (userId) => usersApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const users = data?.users || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      <PageNavigationBar title={`Users (${users.length})`} onBack={() => navigate(-1)} />

      <div style={{ padding: '12px 16px', flex: 1 }}>
        {isLoading ? <LoadingScreen /> : users.length === 0 ? (
          <EmptyState icon="👥" title="No active users" body="Activate pending users first." />
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 13, overflow: 'hidden' }}>
            {users.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12, position: 'relative',
              }}>
                {i > 0 && <div style={{ position: 'absolute', top: 0, left: 72, right: 0, height: '0.5px', background: 'var(--separator)' }} />}
                <Avatar name={u.name} color={u.avatarColor} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--label-primary)' }}>
                    {u.name} {u.role === 'admin' && <span style={{ fontSize: 11, background: 'var(--app-accent)', color: 'white', borderRadius: 999, padding: '1px 7px', marginLeft: 4 }}>ADMIN</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 2 }}>{formatPhone(u.phone)}</div>
                  <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 1 }}>
                    {u.lastActiveAt ? `Active ${formatRelative(u.lastActiveAt)}` : 'Never active'}
                  </div>
                </div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => setDeleteTarget(u)}
                    style={{ color: 'var(--color-red)', background: 'var(--fill-tertiary)', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-text)' }}
                    id={`delete-user-${u.id}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        isOpen={!!deleteTarget}
        title="Delete User?"
        message={`Delete ${deleteTarget?.name}? Their account and all data will be permanently removed.`}
        onClose={() => setDeleteTarget(null)}
        actions={[
          { label: 'Cancel', onClick: () => setDeleteTarget(null) },
          { label: 'Delete', destructive: true, bold: true, onClick: () => deleteUser(deleteTarget?.id) },
        ]}
      />
    </div>
  );
}
