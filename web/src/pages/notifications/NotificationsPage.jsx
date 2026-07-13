// Credit Book — Notifications Page (Tab 3)
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationsApi } from '../../api';
import { formatRelative } from '../../utils';
import { Button, LoadingScreen, EmptyState } from '../../components/ui/Components';
import { NavigationBar } from '../../components/layout/AppLayout';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'transaction', label: '💸 Transactions' },
  { id: 'support', label: '💬 Support' },
  { id: 'update', label: '📦 Updates' },
  { id: 'activation', label: '✅ Activation' },
  { id: 'announcement', label: '📢 News' },
];

const categoryIcons = {
  transaction: '💸', support: '💬', update: '📦',
  activation: '✅', announcement: '📢', system: '🔔',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', activeCategory],
    queryFn: () => notificationsApi.getAll({ category: activeCategory === 'all' ? undefined : activeCategory }),
    select: (d) => d?.data,
  });

  const { mutate: markAllRead, isPending: isMarkingRead } = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      toast.success('All marked as read');
    },
  });

  const { mutate: markOne } = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Nav Bar with desktop tab nav */}
      <NavigationBar
        title="Notifications"
        onAction={unreadCount > 0 ? () => markAllRead() : undefined}
        actionLabel="Mark all read"
      />

      {/* Category Filter */}
      <div style={{ overflowX: 'auto', display: 'flex', gap: 8, padding: '10px 16px', scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              flexShrink: 0,
              height: 32,
              padding: '0 14px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-text)',
              background: activeCategory === cat.id ? 'var(--app-accent)' : 'var(--fill-tertiary)',
              color: activeCategory === cat.id ? 'white' : 'var(--label-secondary)',
              transition: 'all 200ms ease',
            }}
            id={`notif-filter-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ padding: '4px 16px', flex: 1 }}>
        {isLoading ? (
          <LoadingScreen />
        ) : notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" body="You're all caught up!" />
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 13, overflow: 'hidden' }}>
            {notifications.map((notif, i) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markOne(notif.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px',
                  background: notif.isRead ? 'transparent' : 'hsla(214,100%,50%,0.05)',
                  cursor: 'default',
                  position: 'relative',
                }}
              >
                {i > 0 && (
                  <div style={{ position: 'absolute', top: 0, left: 52, right: 0, height: '0.5px', background: 'var(--separator)' }} />
                )}
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--fill-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {categoryIcons[notif.category] || '🔔'}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: notif.isRead ? 400 : 600, fontSize: 15, color: 'var(--label-primary)', lineHeight: 1.3 }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginTop: 3, lineHeight: 1.4 }}>
                    {notif.body}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 4 }}>
                    {formatRelative(notif.createdAt)}
                  </div>
                </div>
                {/* Unread dot */}
                {!notif.isRead && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--app-accent)', flexShrink: 0, marginTop: 6,
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
