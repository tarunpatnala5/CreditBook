// Credit Book — Admin Password Reset Requests Page
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Avatar, Spinner } from '../../components/ui/Components';
import { formatRelative } from '../../utils';
import './AdminPasswordReset.css';

export default function AdminPasswordResetPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.setQueryData(['admin-counts'], (old) =>
      old ? { ...old, pendingReset: 0 } : old
    );
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pw-reset-requests'],
    queryFn: () => usersApi.getPasswordResetRequests(),
    select: (r) => r.data,
    refetchInterval: 20000,
    staleTime: 0,
  });

  const { mutate: markSent, isPending: isMarking } = useMutation({
    mutationFn: ({ id, waLink }) => {
      window.open(waLink, '_blank', 'noopener,noreferrer');
      return usersApi.markResetSent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pw-reset-requests'] });
      toast.success('Sent via WhatsApp');
    },
    onError: (err) => toast.error(err.message),
  });

  const sorted = (data || [])
    .filter((r) => new Date() <= new Date(r.expiresAt))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      <PageNavigationBar title="Password Reset Requests" onBack={() => navigate(-1)} />
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner size={28} />
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 }}>
            <div style={{ fontSize: 48 }}>🔐</div>
            <p style={{ fontSize: 15, color: 'var(--label-secondary)', margin: 0, textAlign: 'center' }}>
              No pending password reset requests
            </p>
          </div>
        ) : (
          sorted.map((req) => {
            const isSent = req.status === 'sent';
            const displayName = req.userName || 'Unknown User';
            return (
              <div key={req.id} style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
                <Avatar name={displayName} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--label-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 3 }}>{req.phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>{formatRelative(req.createdAt)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, padding: '1px 7px', borderRadius: 6, color: isSent ? 'hsl(152,50%,38%)' : 'var(--color-orange)', background: isSent ? 'hsl(152,50%,38%,0.12)' : 'hsl(38,95%,50%,0.12)' }}>
                      {isSent ? 'SENT' : 'PENDING'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <a href={req.waLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--label-tertiary)', textDecoration: 'none', letterSpacing: 0.2 }}>
                    wa.me &#x2197;
                  </a>
                  <button
                    id={`send-reset-${req.id}`}
                    disabled={isMarking}
                    onClick={() => markSent({ id: req.id, waLink: req.waLink })}
                    style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-text)', color: 'var(--app-accent)', background: 'hsla(211,100%,50%,0.10)', border: 'none', borderRadius: 10, cursor: 'pointer', padding: '7px 14px', letterSpacing: 0.1, lineHeight: 1 }}
                  >
                    {isSent ? 'Resend' : 'Send'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}