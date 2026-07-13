// Credit Book — Support Chat Page (iMessage style)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supportApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { formatTime, formatDateShort } from '../../utils';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Spinner, LoadingScreen } from '../../components/ui/Components';

export default function SupportChatPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['support-messages'],
    queryFn: () => supportApi.getMessages(),
    select: (d) => d?.data,
    refetchInterval: 10000, // Poll every 10s
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (msg) => supportApi.send(msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-messages'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      setMessage('');
    },
    onError: (err) => toast.error(err.message || 'Failed to send'),
  });

  const messages = data?.messages || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend() {
    if (!message.trim()) return;
    sendMessage(message.trim());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date
  function groupByDate(msgs) {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;

    msgs.forEach((msg) => {
      const date = formatDateShort(msg.createdAt);
      if (date !== currentDate) {
        currentDate = date;
        currentGroup = { date, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    });
    return groups;
  }

  const grouped = groupByDate(messages);
  const isUserMessage = (msg) => msg.senderId === user?.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg-primary)' }}>
      {/* Nav Bar */}
      <div className="nav-bar-page">
        <button className="nav-back-btn" onClick={() => navigate(-1)} id="support-back-btn">
          <svg width="10" height="16" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 1L1 9l8 8" />
          </svg>
          Back
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--label-primary)' }}>Support</div>
          <div style={{ fontSize: 11, color: 'var(--label-secondary)' }}>Credit Book Team</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isLoading ? (
          <LoadingScreen />
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--label-secondary)', textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--label-primary)' }}>Chat with Support</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              Send a message and the admin will reply as soon as possible. You'll get a notification when they reply.
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div style={{ textAlign: 'center', margin: '12px 0 8px', fontSize: 12, color: 'var(--label-tertiary)', fontWeight: 500 }}>
                {group.date}
              </div>
              {group.messages.map((msg) => {
                const isMine = isUserMessage(msg);
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{
                      maxWidth: '75%',
                      padding: '9px 14px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine ? 'var(--app-accent)' : 'var(--bg-secondary)',
                      color: isMine ? 'white' : 'var(--label-primary)',
                      fontSize: 15,
                      lineHeight: 1.4,
                      boxShadow: 'var(--shadow-xs)',
                      border: isMine ? 'none' : '0.5px solid var(--separator)',
                    }}>
                      {!isMine && (
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-accent)', marginBottom: 2 }}>
                          Admin
                        </div>
                      )}
                      {msg.message}
                      <div style={{
                        fontSize: 10, marginTop: 3, textAlign: 'right',
                        color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--label-tertiary)',
                      }}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: '8px 16px 24px',
        background: 'var(--nav-bg)',
        backdropFilter: 'var(--blur-nav)',
        borderTop: '0.5px solid var(--separator)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
      }}>
        <div style={{
          flex: 1,
          background: 'var(--fill-tertiary)',
          borderRadius: 20,
          padding: '8px 14px',
          minHeight: 38,
          display: 'flex',
          alignItems: 'center',
        }}>
          <textarea
            id="support-message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            style={{
              flex: 1, resize: 'none', background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-text)', fontSize: 15, color: 'var(--label-primary)',
              maxHeight: 120, lineHeight: 1.4, padding: 0,
            }}
          />
        </div>
        <button
          id="support-send-btn"
          onClick={handleSend}
          disabled={!message.trim() || isPending}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: message.trim() ? 'var(--app-accent)' : 'var(--fill-primary)',
            border: 'none', cursor: message.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 200ms ease, transform 120ms ease',
          }}
        >
          {isPending ? (
            <Spinner size={16} color="white" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
