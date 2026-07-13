# Credit Book — Support Chat Documentation
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Overview

Credit Book includes a built-in support chat system that allows family members to communicate directly with the admin (Tarun Kumar). The chat interface follows Apple's iMessage design aesthetic — clean, familiar, and intuitive.

---

## 2. User Experience

### 2.1 User Side (Settings → Support Chat)

```
┌─────────────────────────────────────────┐
│ ← Support Chat               Admin ●    │  ← Nav bar with online indicator
├─────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐    │
│  │ 13 Jul • 09:15 AM               │    │  ← Date separator
│  └─────────────────────────────────┘    │
│                                          │
│         ╔══════════════════════╗         │
│         ║ Hi! I need help with ║         │  ← User message (right, blue)
│         ║ interest calculation ║         │
│         ╚══════════════════════╝         │
│                        09:15 AM ✓✓       │
│                                          │
│  ╔═══════════════════════════╗           │
│  ║ Hello! The interest is   ║           │  ← Admin reply (left, gray)
│  ║ calculated daily at      ║           │
│  ║ midnight. Simple interest║           │
│  ╚═══════════════════════════╝           │
│  09:18 AM                                │
│                                          │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════╗ Send  │  ← Input bar
│ ║ Type a message...             ║  →   │
│ ╚═══════════════════════════════╝       │
└─────────────────────────────────────────┘
```

### 2.2 Chat Features (User)

- Send text messages
- See read receipts (single tick = sent, double tick = read by admin)
- See "Admin is typing..." indicator
- Notification badge on Support Chat row in Settings for unread admin replies
- Persistent conversation history

---

## 3. Admin Experience

### 3.1 Admin Side (Settings → Support Requests)

**Conversation List (WhatsApp-style):**

```
┌─────────────────────────────────────────┐
│ ← Support Requests                   3  │  ← Total unread
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ 👤 Ravi Kumar         09:15 AM  │    │
│  │    +91 98765 43210         ●2   │    │  ← 2 unread
│  │    Hi! I need help with...       │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 👤 Priya Kumar        Yesterday │    │
│  │    +91 98765 43211             │    │
│  │    Thank you for your help      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Individual Chat (same as user view, mirrored):**
- Admin's messages appear on the right (blue)
- User's messages appear on the left (gray)
- Admin can see full conversation history

### 3.2 Admin Support Features

- View all user conversations in one place
- Reply to any user
- See unread count per user
- Sort by: Unread first, Most recent
- Notification sound + badge when user sends message

---

## 4. Real-time Implementation

### 4.1 WebSocket Events

```javascript
// Server WebSocket events for support chat

// When user sends message:
socket.on('support_send', async (data, callback) => {
  const { message } = data;
  const userId = socket.userId;
  
  const savedMessage = await db.supportMessages.create({
    data: {
      userId,         // Conversation owner (the user)
      senderId: userId, // Who sent it
      message: message.trim(),
    }
  });
  
  // Notify admin in real-time
  const adminSockets = getUserSockets(ADMIN_USER_ID);
  adminSockets.forEach(s => {
    s.emit('support_new_message', {
      userId,
      message: savedMessage
    });
  });
  
  // Send push notification to admin
  await pushService.sendToUser(ADMIN_USER_ID, {
    title: `${socket.userName}`,
    body: message.length > 50 ? message.substring(0, 50) + '...' : message,
    category: 'support',
    deepLink: `/admin/support/${userId}`
  });
  
  callback({ success: true, message: savedMessage });
});

// When admin replies:
socket.on('support_reply', async (data, callback) => {
  if (!socket.isAdmin) throw new Error('Unauthorized');
  
  const { userId, message } = data;
  
  const savedMessage = await db.supportMessages.create({
    data: {
      userId,              // Conversation owner (the user)
      senderId: socket.userId, // Admin ID
      message: message.trim(),
    }
  });
  
  // Notify user in real-time
  const userSockets = getUserSockets(userId);
  userSockets.forEach(s => {
    s.emit('support_reply_received', { message: savedMessage });
  });
  
  // Create in-app notification + push
  await notificationService.createNotification(userId, {
    title: 'Reply from Admin',
    body: message.length > 80 ? message.substring(0, 80) + '...' : message,
    category: 'support',
  });
  
  callback({ success: true, message: savedMessage });
});
```

### 4.2 Read Receipts

```javascript
// Mark messages as read
socket.on('support_mark_read', async ({ messageIds }) => {
  await db.supportMessages.updateMany({
    where: { id: { in: messageIds } },
    data: { isRead: true, readAt: new Date() }
  });
  
  // Notify the sender that their messages were read
  // (send to admin if user read, send to user if admin read)
});
```

---

## 5. Message Storage

```sql
-- support_messages table (from Database Design)
-- Each message stores:
-- - user_id: the conversation it belongs to
-- - sender_id: who sent it (user or admin)
-- - message: text content
-- - is_read: read receipt
-- - read_at: timestamp of read

-- Query: get all messages in a conversation
SELECT * FROM support_messages 
WHERE user_id = :userId 
  AND deleted_at IS NULL 
ORDER BY created_at ASC;

-- Query: get unread count per conversation (admin view)
SELECT user_id, COUNT(*) as unread
FROM support_messages
WHERE sender_id != :adminId  -- Not sent by admin
  AND is_read = FALSE
  AND deleted_at IS NULL
GROUP BY user_id;
```

---

## 6. Message Components

### 6.1 Message Bubble CSS

```css
/* User message (right aligned, blue) */
.message-bubble-user {
  background: var(--color-blue);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: var(--space-2) var(--space-4);
  max-width: 75%;
  margin-left: auto;
  font-family: 'SF Pro Text', sans-serif;
  font-size: 16px;
  line-height: 1.4;
}

/* Admin/other message (left aligned, gray) */
.message-bubble-other {
  background: var(--fill-secondary);
  color: var(--label-primary);
  border-radius: 18px 18px 18px 4px;
  padding: var(--space-2) var(--space-4);
  max-width: 75%;
  margin-right: auto;
}

/* Timestamp */
.message-timestamp {
  font-size: 11px;
  color: var(--label-tertiary);
  margin-top: 2px;
  text-align: right;
}

/* Read receipt */
.message-read-receipt {
  font-size: 10px;
  color: var(--color-blue);
  margin-left: 2px;
}
```

---

## 7. Support Message Retention

- All support messages retained for 1 year
- Older messages archived (not deleted — admin can still see)
- Users cannot delete support messages (admin logs)

---

*Credit Book Support Chat Documentation — v1.0.0*
