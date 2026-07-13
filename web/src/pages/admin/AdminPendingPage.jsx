// Credit Book — Admin: Pending Activations Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api';
import { formatRelative, formatPhone } from '../../utils';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Avatar, LoadingScreen, EmptyState, Spinner } from '../../components/ui/Components';

export default function AdminPendingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: () => usersApi.getPending(),
    select: (d) => d?.data,
    refetchInterval: 30000,
  });

  const { mutate: activate } = useMutation({
    mutationFn: (userId) => usersApi.activate(userId),
    onMutate: (userId) => { setProcessingId(userId); setProcessingAction('activate'); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User activated! They can now sign in.');
      setProcessingId(null); setProcessingAction(null);
    },
    onError: (err) => { toast.error(err.message); setProcessingId(null); setProcessingAction(null); },
  });

  const { mutate: reject } = useMutation({
    mutationFn: (userId) => usersApi.reject(userId),
    onMutate: (userId) => { setProcessingId(userId); setProcessingAction('reject'); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending'] });
      toast.success('User rejected');
      setProcessingId(null); setProcessingAction(null);
    },
    onError: (err) => { toast.error(err.message); setProcessingId(null); setProcessingAction(null); },
  });

  const users = data?.users || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      <PageNavigationBar title={`Pending (${users.length})`} onBack={() => navigate(-1)} />

      {/* Banner */}
      {users.length > 0 && (
        <div style={{
          margin: '12px 16px 4px',
          background: 'hsla(28, 100%, 50%, 0.10)',
          border: '1px solid hsla(28, 100%, 50%, 0.25)',
          borderRadius: 12, padding: '10px 14px',
          fontSize: 13, color: 'var(--color-orange)',
        }}>
          ⏳ {users.length} account{users.length !== 1 ? 's' : ''} waiting for activation
        </div>
      )}

      <div style={{ padding: '12px 16px', flex: 1 }}>
        {isLoading ? <LoadingScreen /> : users.length === 0 ? (
          <EmptyState icon="✅" title="All caught up!" body="No pending activations right now." />
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 13, overflow: 'hidden' }}>
            {users.map((u, i) => {
              const isProcessing = processingId === u.id;
              return (
                <div key={u.id} style={{ padding: '16px', position: 'relative' }}>
                  {i > 0 && <div style={{ position: 'absolute', top: 0, left: 16, right: 0, height: '0.5px', background: 'var(--separator)' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Avatar name={u.name} color={u.avatarColor} size={44} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--label-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 2 }}>{formatPhone(u.phone)}</div>
                      <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 1 }}>
                        Registered {formatRelative(u.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      id={`approve-${u.id}`}
                      onClick={() => activate(u.id)}
                      disabled={isProcessing}
                      style={{
                        flex: 1, height: 44, borderRadius: 12,
                        background: 'var(--color-green)', color: 'white',
                        border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'var(--font-text)',
                        opacity: isProcessing ? 0.7 : 1,
                        transition: 'opacity 150ms ease',
                      }}
                    >
                      {isProcessing && processingAction === 'activate' ? <Spinner size={18} color="white" /> : '✓ Approve'}
                    </button>
                    <button
                      id={`reject-${u.id}`}
                      onClick={() => reject(u.id)}
                      disabled={isProcessing}
                      style={{
                        flex: 1, height: 44, borderRadius: 12,
                        background: 'var(--fill-tertiary)', color: 'var(--color-red)',
                        border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: 'var(--font-text)',
                        opacity: isProcessing ? 0.7 : 1,
                        transition: 'opacity 150ms ease',
                      }}
                    >
                      {isProcessing && processingAction === 'reject' ? <Spinner size={18} /> : '✕ Reject'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
