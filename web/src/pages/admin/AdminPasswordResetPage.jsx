// Credit Book — Admin Password Reset Requests Page
import React from 'react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pw-reset-requests'],
    queryFn: () => usersApi.getPasswordResetRequests(),
    select: (r) => r.data,
    refetchInterval: 30000,
    staleTime: 0,
  });

  const { mutate: markSent, isPending: isMarking } = useMutation({
    mutationFn: ({ id, waLink }) => {
      window.open(waLink, '_blank', 'noopener,noreferrer');
      return usersApi.markResetSent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pw-reset-requests'] });
      toast.success('Marked as sent');
    },
    onError: (err) => toast.error(err.message),
  });

  const requests = data || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      <PageNavigationBar title="Password Reset Requests" onBack={() => navigate(-1)} />

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner size={28} />
          </div>
        ) : requests.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: 48, gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>🔐</div>
            <p style={{ fontSize: 15, color: 'var(--label-secondary)', margin: 0, textAlign: 'center' }}>
              No pending password reset requests
            </p>
          </div>
        ) : (
          requests.map((req) => {
            const isExpired = new Date() > new Date(req.expiresAt);
            const displayName = req.userName || 'Unknown User';

            return (
              <div key={req.id} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 16,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: 'var(--shadow-xs)',
                opacity: isExpired ? 0.55 : 1,
              }}>
                {/* Avatar */}
                <Avatar name={displayName} size={44} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: 'var(--label-primary)', marginBottom: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 3 }}>
                    {req.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>
                      {formatRelative(req.createdAt)}
                    </span>
                    {/* Status pill */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                      padding: '1px 7px', borderRadius: 6,
                      color: isExpired ? 'var(--label-tertiary)'
                           : req.status === 'sent' ? 'hsl(152,50%,38%)'
                           : 'var(--color-orange)',
                      background: isExpired ? 'var(--fill-secondary)'
                                : req.status === 'sent' ? 'hsl(152,50%,38%, 0.12)'
                                : 'hsl(38,95%,50%,0.12)',
                    }}>
                      {isExpired ? 'EXPIRED' : req.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Send button */}
                {!isExpired && (
                  <button
                    id={`send-reset-${req.id}`}
                    disabled={isMarking}
                    onClick={() => markSent({ id: req.id, waLink: req.waLink })}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      background: 'hsl(142,50%,40%)', color: '#fff',
                      border: 'none', borderRadius: 12, cursor: 'pointer',
                      padding: '10px 14px', flexShrink: 0,
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-text)',
                      letterSpacing: 0.3, lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>📲</span>
                    Send
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
