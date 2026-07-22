// Credit Book — Admin Password Reset Requests Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../../api';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Spinner } from '../../components/ui/Components';
import { formatRelative } from '../../utils';
import './AdminPasswordReset.css';

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', color: 'var(--color-orange)' },
    sent:    { label: 'Sent',    color: 'hsl(152,50%,38%)' },
    used:    { label: 'Used',    color: 'var(--label-tertiary)' },
    expired: { label: 'Expired', color: 'var(--label-tertiary)' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
      color: s.color, background: `${s.color}18`,
      borderRadius: 6, padding: '2px 8px',
    }}>
      {s.label.toUpperCase()}
    </span>
  );
}

export default function AdminPasswordResetPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pw-reset-requests'],
    queryFn: () => usersApi.getPasswordResetRequests(),
    select: (r) => r.data,
    refetchInterval: 30000,
  });

  const { mutate: markSent, isPending: isMarking } = useMutation({
    mutationFn: ({ id, waLink }) => {
      // Open WhatsApp link in new tab
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
    <div className="admin-pw-reset-page">
      <PageNavigationBar title="Password Reset Requests" onBack={() => navigate(-1)} />

      <div className="admin-pw-reset-content">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner size={28} />
          </div>
        ) : requests.length === 0 ? (
          <div className="admin-pw-reset-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
            <p style={{ fontSize: 15, color: 'var(--label-secondary)', margin: 0 }}>
              No pending password reset requests
            </p>
          </div>
        ) : (
          <div className="admin-pw-reset-list">
            {requests.map((req) => {
              const isExpired = new Date() > new Date(req.expiresAt);
              return (
                <div key={req.id} className="admin-pw-reset-card">
                  {/* Header row */}
                  <div className="admin-pw-reset-header">
                    <div className="admin-pw-reset-phone">
                      <span style={{ fontSize: 18 }}>📱</span>
                      <span className="admin-pw-reset-phone-text">{req.phone}</span>
                    </div>
                    <StatusBadge status={isExpired ? 'expired' : req.status} />
                  </div>

                  {/* Meta */}
                  <div className="admin-pw-reset-meta">
                    <span>Requested {formatRelative(req.createdAt)}</span>
                    {req.sentAt && <span>· Sent {formatRelative(req.sentAt)}</span>}
                    <span style={{ color: isExpired ? 'var(--color-red)' : 'var(--label-tertiary)' }}>
                      · {isExpired ? 'Link expired' : `Expires ${formatRelative(req.expiresAt)}`}
                    </span>
                  </div>

                  {/* Reset link (copyable) */}
                  <div className="admin-pw-reset-link-row">
                    <span className="admin-pw-reset-link">{req.resetLink}</span>
                    <button
                      className="admin-pw-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(req.resetLink);
                        toast.success('Link copied!');
                      }}
                      title="Copy link"
                    >
                      📋
                    </button>
                  </div>

                  {/* Send via WhatsApp button */}
                  {!isExpired && (
                    <button
                      className="admin-pw-send-btn"
                      id={`send-reset-${req.id}`}
                      disabled={isMarking}
                      onClick={() => markSent({ id: req.id, waLink: req.waLink })}
                    >
                      <span>📲</span>
                      <span>Send via WhatsApp</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
