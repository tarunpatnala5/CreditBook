// Credit Book — Admin Support Chat (WhatsApp-style)
// Left sidebar: all user conversations | Right panel: selected chat
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supportApi } from '../../api';
import useAuthStore from '../../store/authStore';
import { formatTime, formatDateShort, formatRelative } from '../../utils';
import { PageNavigationBar } from '../../components/layout/AppLayout';
import { Avatar, LoadingScreen, EmptyState, Spinner } from '../../components/ui/Components';
import './AdminSupportChat.css';

// ─── Conversation List Item ────────────────────────────────────────────────
function ConvoItem({ convo, isSelected, onClick }) {
  const hasUnread = convo.unreadCount > 0;
  return (
    <div
      className={`convo-item ${isSelected ? 'convo-item-active' : ''}`}
      onClick={onClick}
      id={`convo-${convo.userId}`}
    >
      <div className="convo-avatar-wrap">
        <Avatar name={convo.userName} color={convo.avatarColor} size={48} />
        {hasUnread && <span className="convo-unread-dot" />}
      </div>
      <div className="convo-meta">
        <div className="convo-top-row">
          <span className={`convo-name ${hasUnread ? 'convo-name-bold' : ''}`}>
            {convo.userName}
          </span>
          {convo.lastMessageAt && (
            <span className="convo-time">{formatRelative(convo.lastMessageAt)}</span>
          )}
        </div>
        <div className="convo-bottom-row">
          <span className="convo-preview">
            {convo.lastMessage || 'No messages yet'}
          </span>
          {hasUnread && (
            <span className="convo-badge">{convo.unreadCount > 99 ? '99+' : convo.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────
function MessageBubble({ msg, isAdmin }) {
  return (
    <div className={`msg-row ${isAdmin ? 'msg-row-admin' : 'msg-row-user'}`}>
      {!isAdmin && (
        <div className="msg-avatar-spacer" />
      )}
      <div className={`msg-bubble ${isAdmin ? 'msg-bubble-admin' : 'msg-bubble-user'}`}>
        <p className="msg-text">{msg.message}</p>
        <span className="msg-time">
          {formatTime(msg.createdAt)}
          {isAdmin && (
            <svg className="msg-tick" width="14" height="10" viewBox="0 0 18 12" fill="none">
              <path d="M1 6l4 4L11 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            </svg>
          )}
        </span>
      </div>
    </div>
  );
}

// ─── Date Separator ────────────────────────────────────────────────────────
function DateSeparator({ date }) {
  return (
    <div className="date-separator">
      <span>{formatDateShort(date)}</span>
    </div>
  );
}

// ─── Chat Panel (right side) ───────────────────────────────────────────────
function ChatPanel({ convo, onClose }) {
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuthStore();
  const [message, setMessage] = useState('');
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-convo', convo.userId],
    queryFn: () => supportApi.getConversation(convo.userId),
    select: (d) => d?.data,
    staleTime: 0,
    refetchInterval: 4000,
  });

  const { mutate: sendReply, isPending } = useMutation({
    mutationFn: (msg) => supportApi.reply(convo.userId, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-convo', convo.userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-conversations'] });
      setMessage('');
      inputRef.current?.focus();
    },
    onError: (err) => toast.error(err.message),
  });

  const messages = data?.messages || [];

  useEffect(() => {
    // Scroll the messages container div directly — avoids page-level scroll jump
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== lastDate) {
      grouped.push({ type: 'date', date: msg.createdAt, id: `date-${day}` });
      lastDate = day;
    }
    grouped.push({ type: 'msg', ...msg });
  }

  function handleSend() {
    if (message.trim() && !isPending) sendReply(message.trim());
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="chat-header">
        {onClose && (
          <button className="chat-back-btn" onClick={onClose} id="chat-back">
            <svg width="9" height="15" viewBox="0 0 9 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M8 1L1 8l7 7" />
            </svg>
          </button>
        )}
        <Avatar name={convo.userName} color={convo.avatarColor} size={38} />
        <div className="chat-header-info">
          <span className="chat-header-name">{convo.userName}</span>
          <span className="chat-header-sub">
            {convo.userPhone || 'Support chat'}
          </span>
        </div>
        <div className="chat-header-actions">
          {/* Refresh indicator */}
          <div className="chat-online-dot" title="Auto-refreshing" />
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chat-messages-scroll" ref={messagesContainerRef}>
        {isLoading ? (
          <LoadingScreen />
        ) : grouped.length === 0 ? (
          <div className="chat-empty">
            <span className="chat-empty-icon">💬</span>
            <p>No messages yet.<br />When {convo.userName} sends a message, it will appear here.</p>
          </div>
        ) : (
          grouped.map((item) =>
            item.type === 'date' ? (
              <DateSeparator key={item.id} date={item.date} />
            ) : (
              <MessageBubble
                key={item.id}
                msg={item}
                isAdmin={item.senderId === adminUser?.id}
              />
            )
          )
        )}
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            id="admin-reply-input"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Reply to ${convo.userName}…`}
            rows={1}
            className="chat-textarea"
          />
        </div>
        <button
          id="admin-reply-send"
          className={`chat-send-btn ${message.trim() ? 'chat-send-btn-active' : ''}`}
          onClick={handleSend}
          disabled={!message.trim() || isPending}
          aria-label="Send"
        >
          {isPending ? (
            <Spinner size={16} color="white" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Empty Chat Placeholder ────────────────────────────────────────────────
function NoChatSelected() {
  return (
    <div className="chat-placeholder">
      <div className="chat-placeholder-icon">💬</div>
      <h3>Support Inbox</h3>
      <p>Select a conversation to start replying.<br />New messages refresh automatically.</p>
    </div>
  );
}

// ─── Main Admin Support Page ───────────────────────────────────────────────
export default function AdminSupportPage() {
  const navigate = useNavigate();
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-support-conversations'],
    queryFn: () => supportApi.getConversations(),
    select: (d) => d?.data,
    refetchInterval: 5000,
    staleTime: 0,
  });

  const conversations = Array.isArray(data) ? data : [];
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  // On mobile: show chat panel fullscreen when selected
  function openConvo(convo) {
    setSelectedConvo(convo);
    setMobileView('chat');
  }

  function closeConvo() {
    setMobileView('list');
    // Keep selectedConvo for desktop (don't deselect)
  }

  // Mobile-only back = go to list
  function handleMobileBack() {
    setMobileView('list');
  }

  return (
    <div className="admin-support-page">
      {/* ── Mobile: list view ── */}
      <div className={`admin-sidebar ${mobileView === 'chat' ? 'mobile-hidden' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button className="nav-back-btn" onClick={() => navigate(-1)} id="admin-support-back" aria-label="Back">
            <svg width="9" height="15" viewBox="0 0 9 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M8 1L1 8l7 7" />
            </svg>
          </button>
          <div className="sidebar-title-wrap">
            <span className="sidebar-title">Support</span>
            {totalUnread > 0 && (
              <span className="sidebar-unread-total">{totalUnread}</span>
            )}
          </div>
          {/* Refresh button removed — page auto-refreshes every 5s */}
        </div>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* Conversation List */}
        <div className="sidebar-list">
          {isLoading ? (
            <LoadingScreen />
          ) : conversations.length === 0 ? (
            <EmptyState
              icon="💬"
              title="No messages yet"
              body="When users send support messages, they'll appear here."
            />
          ) : (
            conversations.map((convo) => (
              <ConvoItem
                key={convo.userId}
                convo={convo}
                isSelected={selectedConvo?.userId === convo.userId}
                onClick={() => openConvo(convo)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Desktop: always show, Mobile: fullscreen chat ── */}
      <div className={`admin-chat-area ${mobileView === 'list' ? 'mobile-hidden' : ''}`}>
        {selectedConvo ? (
          <ChatPanel
            convo={selectedConvo}
            onClose={handleMobileBack}
          />
        ) : (
          <NoChatSelected />
        )}
      </div>
    </div>
  );
}
