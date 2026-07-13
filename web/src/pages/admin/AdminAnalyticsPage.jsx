// Credit Book — Admin: Analytics Dashboard
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api';
import { formatCurrency } from '../../utils';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Avatar, LoadingScreen } from '../../components/ui/Components';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', borderRadius: 16, padding: '16px',
      display: 'flex', flexDirection: 'column', gap: 4, boxShadow: 'var(--shadow-xs)',
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: color || 'var(--label-primary)', lineHeight: 1.1 }}>
        {value}
      </span>
      <span style={{ fontSize: 12, color: 'var(--label-secondary)', fontWeight: 500 }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: 'var(--label-tertiary)' }}>{sub}</span>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsApi.getDashboard(),
    select: (d) => d?.data,
  });

  const stats = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)', paddingBottom: 32 }}>
      <PageNavigationBar title="Analytics Dashboard" onBack={() => navigate(-1)} />

      {isLoading ? <LoadingScreen /> : !stats ? null : (
        <div style={{ padding: '12px 16px' }}>
          {/* Key metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <StatCard icon="👥" label="Active Users" value={stats.totalUsers} />
            <StatCard icon="⏳" label="Pending" value={stats.pendingUsers} color={stats.pendingUsers > 0 ? 'var(--color-orange)' : undefined} />
            <StatCard icon="📱" label="Active (30d)" value={stats.activeUsers} />
            <StatCard icon="💸" label="Transactions" value={stats.totalTransactions} sub={`${stats.txnThisMonth} this month`} />
          </div>

          {/* Money flow */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              MONEY FLOW
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--label-secondary)' }}>Total Gave</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--app-negative)' }}>
                  {formatCurrency(stats.totalGave)}
                </div>
              </div>
              <div style={{ width: '0.5px', background: 'var(--separator)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--label-secondary)' }}>Total Got</div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--app-positive)' }}>
                  {formatCurrency(stats.totalGot)}
                </div>
              </div>
            </div>
          </div>

          {/* Top users */}
          {stats.topUsers?.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ padding: '12px 16px 8px', fontSize: 13, fontWeight: 600, color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                MOST ACTIVE USERS
              </div>
              {stats.topUsers.map((u, i) => (
                <div key={u.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: i > 0 ? '0.5px solid var(--separator)' : 'none' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--label-tertiary)', width: 20 }}>#{i + 1}</span>
                  <Avatar name={u.name || '?'} color={u.avatarColor} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--label-secondary)' }}>{u.phone}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-accent)' }}>
                    {u.transactionCount} entries
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
