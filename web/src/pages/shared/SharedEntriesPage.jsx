// Credit Book — Shared Entries Page (Tab 2)
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { personsApi } from '../../api';
import { formatCurrency } from '../../utils';
import { Avatar, LoadingScreen, EmptyState, SkeletonRow } from '../../components/ui/Components';
import { NavigationBar } from '../../components/layout/AppLayout';

// ─── Live Countdown to deletion ────────────────────────────────────────────
function DeletionCountdown({ deleteScheduledAt }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function tick() {
      const deadline = new Date(deleteScheduledAt).getTime();
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setRemaining('Deleting…');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(`${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deleteScheduledAt]);

  return (
    <div style={{
      fontSize: 10,
      color: 'hsl(4, 65%, 50%)',
      fontWeight: 500,
      marginTop: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 3,
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
      </svg>
      Deleting in {remaining}
    </div>
  );
}

export default function SharedEntriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['shared-persons'],
    queryFn: () => personsApi.getShared(),
    select: (d) => d?.data,
    refetchInterval: 30000,
  });

  const persons = data?.persons || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Nav Bar with desktop tab nav */}
      <NavigationBar title="Shared With Me" />

      {/* Info Banner */}
      <div style={{
        margin: '12px 16px 4px',
        background: 'hsla(214, 100%, 50%, 0.08)',
        border: '1px solid hsla(214, 100%, 50%, 0.15)',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 13,
        color: 'var(--label-secondary)',
        lineHeight: 1.4,
      }}>
        👁 View-only. These are entries others made using your phone number.
      </div>

      {/* List */}
      <div style={{ padding: '12px 16px', flex: 1 }}>
        {isLoading ? (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 13, overflow: 'hidden' }}>
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : persons.length === 0 ? (
          <EmptyState
            icon="📥"
            title="Nothing shared yet"
            body="When someone adds your phone number to their ledger, their entries will appear here."
          />
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 13, overflow: 'hidden' }}>
            {persons.map((person, i) => {
              const balance = parseFloat(person.balance) || 0;
              const isDeleting = !!person.deleteScheduledAt;
              return (
                <div
                  key={person.id}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12,
                    position: 'relative', cursor: 'default',
                    opacity: isDeleting ? 0.75 : 1,
                    background: isDeleting ? 'hsla(4, 65%, 50%, 0.04)' : undefined,
                  }}
                >
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', top: 0, left: 72, right: 0,
                      height: '0.5px', background: 'var(--separator)',
                    }} />
                  )}
                  <Avatar name={person.owner?.name || '?'} color={person.owner?.avatarColor} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--label-primary)' }}>
                      {person.owner?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--label-secondary)', marginTop: 2 }}>
                      Their entry for you
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 16, fontWeight: 700,
                      color: balance >= 0 ? 'var(--app-positive)' : 'var(--app-negative)',
                      fontFamily: 'var(--font-display)',
                    }}>
                      {formatCurrency(Math.abs(balance))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--label-tertiary)', marginTop: 2 }}>
                      {balance >= 0 ? 'you will get' : 'you will give'}
                    </div>
                    {/* Countdown timer — below the amount */}
                    {isDeleting && (
                      <DeletionCountdown deleteScheduledAt={person.deleteScheduledAt} />
                    )}
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
