# Credit Book — Admin Panel Documentation
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Overview

The Admin Panel is accessible only to users with the `admin` role. It is embedded within the Settings tab — admin-only sections appear at the bottom of the Settings page, hidden from normal users.

The admin user (Tarun Kumar) has full system control including user management, support, analytics, updates, and database operations.

---

## 2. Accessing Admin Features

The Admin section in Settings appears only when `user.role === 'admin'`. It includes:

```
Settings Page (Admin View)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFILE
  Name                         Tarun Kumar ›
  Phone Number           +91 98765 43210 ›

PREFERENCES
  Dark Mode                          [●]
  PIN Lock                           [ ]
  Biometric                          [ ]

APP
  User Manual                           ›
  Support Chat                      3 ›   ← badge for pending messages
  Updates                           1 ›   ← badge when update available

ADMIN
  Users                             8 ›   ← total user count
  Pending Activations               2 ›   ← pending count badge
  Support Requests                  3 ›   ← unread count badge
  Analytics Dashboard                   ›
  Announcements                         ›

DANGER ZONE
  Delete Account                        ›
```

---

## 3. Users Management

### 3.1 Active Users Page

```
┌─────────────────────────────────────────┐
│ ← Users                              8  │
├─────────────────────────────────────────┤
│  Search users...                    🔍  │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 👤  Priya Kumar                  │   │
│  │     +91 98765 43211     [Delete] │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 👤  Ravi Kumar                   │   │
│  │     +91 98765 43220     [Delete] │   │
│  └──────────────────────────────────┘   │
│  ...                                     │
└─────────────────────────────────────────┘
```

**Sorting:** Most recently activated first (newest at top).

**Delete User Flow:**
1. Admin taps **[Delete]** button
2. Apple-style alert appears:
   ```
   "Delete User?"
   "This will remove Ravi Kumar's account and all their data."
   [Cancel]     [Delete]
   ```
3. Loading spinner on Delete button while processing
4. On success: user removed from list with smooth animation

---

### 3.2 Pending Activations Page

```
┌─────────────────────────────────────────┐
│ ← Pending Activations                2  │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ Ananya Kumar                     │   │
│  │ +91 98765 43230            ✓  ✗  │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ Suresh Reddy                     │   │
│  │ +91 98765 43240            ✓  ✗  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Each row shows:**
- User's full name (large text)
- Phone number (smaller text below)
- ✓ (green checkmark) — Approve
- ✗ (red cross) — Reject

**Approve Flow:**
1. Admin taps ✓
2. Spinning animation on the row
3. Success: row slides out, badge count decreases
4. User receives push notification + in-app notification

**Reject Flow:**
1. Admin taps ✗
2. Alert: "Reject this user's request?" [Cancel] [Reject]
3. On confirm: row slides out
4. User notified: "Your account request was not approved"

---

## 4. Support Requests

*See `11_Support_Chat_Documentation.md` for full details.*

The admin sees a conversation list with all users who have sent support messages. Unread messages shown with badge count.

---

## 5. Analytics Dashboard

### 5.1 Dashboard Layout

```
┌─────────────────────────────────────────┐
│ ← Analytics                             │
├─────────────────────────────────────────┤
│                                          │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ Total Users │  │ Active Users│       │
│  │     8       │  │     7       │       │
│  └─────────────┘  └─────────────┘       │
│                                          │
│  ┌─────────────┐  ┌─────────────┐       │
│  │  Total Txn  │  │  This Month │       │
│  │    312      │  │     28      │       │
│  └─────────────┘  └─────────────┘       │
│                                          │
│  Monthly Transaction Volume              │
│  ┌────────────────────────────────┐      │
│  │ [Bar Chart - 12 months]        │      │
│  └────────────────────────────────┘      │
│                                          │
│  Money Flow                              │
│  ┌────────────────────────────────┐      │
│  │ Total Give:  ₹1,50,000         │      │
│  │ Total Get:   ₹87,500           │      │
│  │ Interest:    ₹3,450            │      │
│  └────────────────────────────────┘      │
│                                          │
│  Top Active Users                        │
│  ┌────────────────────────────────┐      │
│  │ 1. Ravi Kumar — 45 txn         │      │
│  │ 2. Priya Kumar — 38 txn        │      │
│  └────────────────────────────────┘      │
└─────────────────────────────────────────┘
```

### 5.2 Metrics Tracked

| Metric | Description |
|--------|-------------|
| Total Users | All registered users |
| Active Users | Users who logged in this month |
| Pending Users | Awaiting activation |
| Total Persons | All person entries across all users |
| Total Transactions | All transactions (current + upcoming) |
| Transactions This Month | Created in current calendar month |
| Total Amount Gave | Sum of all 'gave' transactions |
| Total Amount Got | Sum of all 'got' transactions |
| Total Interest Earned | Sum of all interest added |
| Most Active User | User with most transactions |
| New Users This Month | Users who registered this month |

---

## 6. Announcements

Admin can send broadcast messages to all users or specific users:

```
┌─────────────────────────────────────────┐
│ ← Announcements                     [+] │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │ Title                            │   │
│  │ ──────────────────────────────── │   │
│  │ Message                          │   │
│  │                                  │   │
│  │                                  │   │
│  │ ──────────────────────────────── │   │
│  │ Send To: All Users  ›            │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │         Send Announcement        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 7. Database Operations (Admin)

Available in Admin Panel → Database (future feature):

- **Recycle Bin:** View and restore soft-deleted records
- **Force Sync:** Manually trigger all background jobs
- **View Audit Logs:** Full audit trail with filters
- **Export Data:** Download full database export as CSV
- **Database Stats:** Table sizes, row counts

---

## 8. Backup Management

See `13_Backup_and_Disaster_Recovery.md` for full details.

Admin Panel → Backups:
- View last backup status and timestamp
- Trigger manual backup
- Download backup file
- View backup history (last 30 days)

---

*Credit Book Admin Panel Documentation — v1.0.0*
