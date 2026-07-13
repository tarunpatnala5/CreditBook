# Credit Book — Notification System
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Overview

Credit Book uses a multi-channel notification system:
1. **In-app notifications** — stored in database, shown in Notifications tab
2. **Push notifications** — Firebase Cloud Messaging (FCM) for Android/iOS
3. **Web push** — Service Worker-based for web browsers
4. **Real-time alerts** — WebSocket for instant in-app delivery

---

## 2. Notification Categories

| Category | Icon | Color | Description |
|---------|------|-------|-------------|
| `transaction` | ₹ | Blue | New entries, balance changes, upcoming→current |
| `support` | 💬 | Green | Admin replies to support chat |
| `update` | ↓ | Orange | New app version available |
| `activation` | ✓ | Green | Account approved or rejected |
| `announcement` | 📢 | Purple | Admin broadcast messages |
| `system` | ⚙ | Gray | System messages (backup completed, etc.) |

---

## 3. Notification Templates

### 3.1 Transaction Notifications

| Event | Title | Body |
|-------|-------|------|
| Shared entry created | "New entry by {name}" | "{name} added ₹{amount} — {description}" |
| Upcoming → Current | "Entry is now active" | "₹{amount} entry for {personName} is now in Current" |
| Person deleted (linked) | "Account removal" | "{ownerName}'s entry will be removed in 24 hours" |

### 3.2 Account Notifications

| Event | Title | Body |
|-------|-------|------|
| Account activated | "Welcome to Credit Book!" | "Your account has been activated. You can now use all features." |
| Account rejected | "Account status" | "Your account request was not approved. Contact admin for details." |
| Password reset | "Password changed" | "Your Credit Book password has been updated." |

### 3.3 System Notifications

| Event | Title | Body |
|-------|-------|------|
| New update | "Credit Book {version} Available" | "{releaseNotes snippet} — {size}MB" |
| Support reply | "Reply from Admin" | "{messagePreview}" |
| Backup completed | "Backup Complete" | "Your data has been backed up successfully." |

---

## 4. Delivery Flow

```
Event occurs (e.g., transaction created)
         ↓
notification.service.js :: createNotification()
         ↓
     ┌───────────────────────────────┐
     │                               │
     ▼                               ▼
Insert into                    push.service.js
notifications table            :: sendPush()
(in-app notification)               │
     │                               ▼
     ▼                    Get push_tokens for user
WebSocket emit                       │
'notification_new'          ┌────────┴────────┐
to user's connections       ▼                 ▼
                       FCM Android        FCM iOS /
                       sendMulticast()    Web Push
```

---

## 5. Firebase Cloud Messaging Setup

### 5.1 Firebase Admin SDK (Backend)

```javascript
// config/firebase.js
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
```

### 5.2 Send Push Notification

```javascript
// services/push.service.js
const admin = require('../config/firebase');

async function sendPushNotification(userId, notification) {
  // Get all FCM tokens for this user
  const tokens = await db.pushTokens.findMany({
    where: { userId, session: { revokedAt: null } },
    select: { token: true, platform: true }
  });
  
  if (tokens.length === 0) return;
  
  const tokenStrings = tokens.map(t => t.token);
  
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      category: notification.category,
      deepLink: notification.deepLink || '',
      notificationId: notification.id,
    },
    tokens: tokenStrings,
    android: {
      notification: {
        sound: 'default',
        channelId: notification.category,
        priority: 'HIGH',
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: await getUnreadCount(userId),
        }
      }
    }
  };
  
  const response = await admin.messaging().sendEachForMulticast(message);
  
  // Remove invalid tokens
  response.responses.forEach((resp, idx) => {
    if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
      db.pushTokens.delete({ where: { token: tokenStrings[idx] } });
    }
  });
}
```

### 5.3 Flutter FCM Setup (Mobile)

```dart
// services/push_service.dart
import 'package:firebase_messaging/firebase_messaging.dart';

class PushService {
  static final _fcm = FirebaseMessaging.instance;
  
  static Future<void> initialize() async {
    // Request permissions
    await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    
    // Get token and register with backend
    final token = await _fcm.getToken();
    if (token != null) {
      await ApiClient.registerPushToken(token, 'fcm_android');
    }
    
    // Listen for token refresh
    _fcm.onTokenRefresh.listen((newToken) {
      ApiClient.registerPushToken(newToken, 'fcm_android');
    });
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      // Show in-app notification UI
      _handleForegroundMessage(message);
    });
    
    // Handle background taps
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationTap(message);
    });
  }
  
  static void _handleNotificationTap(RemoteMessage message) {
    final deepLink = message.data['deepLink'];
    if (deepLink != null) {
      // Navigate using GoRouter
      AppRouter.router.go(deepLink);
    }
  }
}
```

---

## 6. Web Push (Service Worker)

```javascript
// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data?.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { deepLink: data.deepLink },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const deepLink = event.notification.data?.deepLink || '/';
    clients.openWindow(deepLink);
  }
});
```

---

## 7. Badge Management

### 7.1 Settings Icon Badge

The Settings tab icon shows a badge for:
- Unread notifications count in Notifications category
- Available app update

```javascript
// Frontend: compute settings badge count
function getSettingsBadgeCount(notifications, hasUpdate) {
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const updateBadge = hasUpdate ? 1 : 0;
  return unreadNotifications + updateBadge;
}
```

### 7.2 Notifications Tab Badge

Shows count of all unread notifications (all categories).

### 7.3 iOS App Badge

Updated via the `badge` field in APNs payload = total unread notification count.

---

## 8. Notification Management UI

### 8.1 Notifications Page Layout

```
┌─────────────────────────────────────────┐
│ ← Notifications          Mark All Read  │  ← Nav bar
├─────────────────────────────────────────┤
│ [Transactions] [Support] [Updates] [+] │  ← Category pills
├─────────────────────────────────────────┤
│  Today                                  │
│  ┌───────────────────────────────────┐  │
│  │ ₹  Ravi added ₹500         1h    │  │
│  │    Grocery money                  │  │  ← Unread (slightly tinted)
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ↓  Update available v1.2    2h   │  │
│  │    New features + bug fixes       │  │
│  └───────────────────────────────────┘  │
│  Yesterday                              │
│  ┌───────────────────────────────────┐  │
│  │ ✓  Account activated         1d   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 8.2 Notification Row

- Swipe left → Delete action (red, with trash icon)
- Tap → Mark as read + deep-link navigate
- Unread rows: slightly tinted background

---

## 9. Admin Announcements

Admin can send broadcast notifications to all users or specific users:

```javascript
// Admin: POST /admin/announcements
async function sendAnnouncement(title, body, targetUserIds = null) {
  const announcement = await db.announcements.create({
    data: { title, body, targetUserIds, isPublished: true, publishedAt: new Date() }
  });
  
  // Get target users
  const users = targetUserIds
    ? await db.users.findMany({ where: { id: { in: targetUserIds } } })
    : await db.users.findMany({ where: { status: 'active' } });
  
  // Create notifications for each user
  await Promise.all(users.map(user =>
    createNotification(user.id, {
      title,
      body,
      category: 'announcement',
    })
  ));
}
```

---

## 10. Notification Retention

- **Unread notifications:** Kept indefinitely until read or deleted by user
- **Read notifications:** Deleted after 90 days (automated cleanup job)
- **Admin announcements:** Kept in `announcements` table permanently for audit

---

*Credit Book Notification System — v1.0.0*
