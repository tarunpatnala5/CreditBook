# Credit Book — Software Requirements Specification (SRS)
**Version:** 1.0.0  
**Date:** 2026-07-13  
**Status:** Approved for Development  
**Classification:** Private Family Application

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete software requirements for **Credit Book**, a private family ledger application. It serves as the single source of truth for all stakeholders — designers, developers, testers, and administrators.

### 1.2 Project Overview
Credit Book is a modern, Apple-design-language-inspired financial ledger application for private family use. It enables recording and tracking of money given and received between family members and third parties. It is **NOT** a commercial application and will **NOT** be published on any public app store. Distribution is via direct APK sideloading (Android) and internal iOS builds. The web application is deployed on Vercel and Render for family access.

### 1.3 Scope
- **Android APK** (sideloaded, private use)
- **iOS App** (internal distribution via TestFlight or direct install)
- **Web Application** (Desktop + Mobile responsive) deployed on Vercel (frontend) and Render (backend)
- **Single shared backend** with a real-time database

### 1.4 Name Decision
**Selected Name:** Credit Book  
**Alternative Considered:** LedgerMate, FamilyBook, TrustLedger  
**Recommendation:** If the user wishes a more premium name, consider **"LedgerMate"** or **"FamilyLedger"**. The name **Credit Book** is clean and descriptive — approved.

### 1.5 Definitions
| Term | Definition |
|------|-----------|
| Admin | The primary account owner (family head) with full system access |
| Normal User | A family member with standard ledger access |
| Entry | A single recorded financial transaction |
| Person | A contact/party associated with a ledger |
| You Give | Money you have given to someone (they owe you) |
| You Get | Money you owe to someone (you received from them) |
| Upcoming Transaction | A transaction scheduled for a future date |
| Current Transaction | A transaction that is active today |
| Soft Delete | Record hidden from UI but not physically removed from DB |
| Recycle Bin | UI for viewing and restoring soft-deleted records |
| Interest | Optional percentage-based compound/simple interest on a transaction |

---

## 2. Stakeholders

| Role | Description |
|------|-----------|
| Admin (Owner) | Patnala Tarun Kumar — full system control |
| Family Members | Additional registered users (require admin activation) |
| System | Automated background services (cron jobs, sync, backup) |

---

## 3. System Overview

### 3.1 Architecture
- **Frontend (Web):** React.js (Vite) + Apple design system
- **Mobile:** Flutter (cross-platform — Android + iOS)
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (primary) + Redis (cache/realtime pub-sub)
- **Realtime:** Socket.IO
- **File Storage:** Cloudinary (free tier) or local storage with Backblaze B2 (free tier)
- **Push Notifications:** Firebase Cloud Messaging (FCM) — free
- **Deployment:** Vercel (frontend) + Render (backend + DB)

### 3.2 Platforms
| Platform | Technology | Distribution |
|---------|-----------|-------------|
| Android | Flutter | APK sideload |
| iOS | Flutter | TestFlight / AltStore |
| Web (Desktop) | React + Vite | Vercel |
| Web (Mobile) | React + Vite (responsive) | Vercel |
| Backend | Node.js + Express | Render |
| Database | PostgreSQL | Render |

---

## 4. Functional Requirements

### 4.1 Authentication Module

#### FR-AUTH-001: User Registration
- User provides: Full Name, Phone Number (mandatory), Password, Confirm Password
- System validates: phone format, password match, password strength
- After registration: Show popup "Your account is pending activation. Please contact the admin."
- Account remains inactive until Admin activates it

#### FR-AUTH-002: User Login
- Fields: Phone Number + Password
- On success: JWT token issued, session created
- On failure: Show Apple-style error alert with retry

#### FR-AUTH-003: Admin Activation
- Admin sees pending users list in Settings > User Activations
- Admin can Approve (✓) or Reject (✗) each user
- On approval: User receives push notification "Your Credit Book account is now active!"
- On rejection: User receives notification with reason

#### FR-AUTH-004: Forgot Password
- User enters phone number
- Admin sets new password for user (no SMS OTP — family-only app)
- Alternative: Admin resets password from Admin Panel

#### FR-AUTH-005: PIN Lock
- Optional 6-digit PIN for app lock
- Fingerprint / Face Unlock (biometric) supported on Android and iOS
- PIN can be set/changed/removed in Settings

#### FR-AUTH-006: Session Management
- JWT with 30-day expiry (refresh token system)
- Concurrent session detection
- Force logout from all devices (Admin can do this for any user)

---

### 4.2 Home Screen Module

#### FR-HOME-001: Top Navigation Bar
- Left: App logo + "Credit Book" wordmark
- Right: Search icon + Plus ("+") button
- Search behavior:
  - Tap search icon → navigation bar animates out → search field slides in with Apple spring animation
  - Cross (×) button appears in search bar to cancel
  - Results filter accounts list in real-time
  - On cancel: search field slides out, nav bar animates back in

#### FR-HOME-002: Summary Dashboard Cards
- **You Give** card: Total amount you have given (green — you will receive this)
- **You Get** card: Total amount you have received (red — you owe this)
- Both update in real-time via WebSocket

#### FR-HOME-003: Accounts List (My Entries Tab)
- Shows all persons/contacts added by the current user
- Each row: Avatar (initials) + Name + Last activity time + Balance
- Balance color: Green (they owe you) or Red (you owe them)
- Tap row → navigate to Person's transaction page
- Sort: most recently active at top

#### FR-HOME-004: Floating Apple Pill Bottom Navigation
- **Tab 1 (Upload icon):** My Entries — accounts I manage
- **Tab 2 (Download icon):** Shared Entries — accounts where others used my number
- **Tab 3 (Bell icon):** Notifications — with red badge count
- **Tab 4 (Gear icon):** Settings — with badge for unread items
- Pill style: frosted glass, rounded, floating above content
- iOS 26 Apple Music-style bottom bar

---

### 4.3 Person / Contact Module

#### FR-PERSON-001: Create Person
- Triggered by "+" button on home screen
- Apple-style bottom sheet / modal with:
  - Name field (required)
  - Phone number field (optional but important)
- On save: Person created, database entry for their phone number created
- If phone number matches an existing Credit Book user → linked automatically

#### FR-PERSON-002: Person Detail Page
- Top: Back button ← | Avatar + Name | Settings (⚙) icon
- Below header: Summary card (You will give / You will get + amount)
- Two pill buttons: **Current** | **Upcoming**
- Transaction list (Current or Upcoming based on selected pill)
- Bottom: Two action buttons — **YOU GAVE ₹** (red) | **YOU GOT ₹** (green)

#### FR-PERSON-003: Person Settings (via ⚙ icon)
- Apple-style action sheet / bottom sheet with options:
  - Edit Name
  - Edit Phone Number
  - Download Report (sub-popup with date range picker: Current Month, Last Month, Last 6 Months, Last 1 Year, Custom)
  - Delete Person
    - Show: "This account will be deleted in 24 hours. The linked party will lose view access after 24 hours."
    - Countdown text displayed on person card during grace period
    - Actual database soft-delete at 24-hour mark

#### FR-PERSON-004: Edit Person
- Inline edit via Apple-style popup modal
- Fields: Name, Phone Number
- Buttons: Save (blue) | Cancel (gray)

#### FR-PERSON-005: Delete Person
- Soft delete with 24-hour delay
- Undo available during grace period
- After 24 hours: person disappears from Shared Entries (Tab 2) for linked user
- Recycle Bin available in Admin settings for hard restore

---

### 4.4 Transaction Module

#### FR-TXN-001: Create Transaction
- Triggered by "YOU GAVE ₹" or "YOU GOT ₹" buttons
- Apple-style bottom sheet with:
  - Amount (numeric, required)
  - Description (text, optional)
  - Date/Time (default: now, adjustable)
  - Interest % (optional)
  - If date is future → automatically classified as "Upcoming"
- On save → appear in transaction list with real-time update

#### FR-TXN-002: Transaction Display
- Each transaction card shows:
  - Amount (large, top, colored: red = gave, green = got)
  - Date and Time (below amount)
  - Running balance (below date)
  - Description (in same card)
- Tap → open transaction detail sheet

#### FR-TXN-003: Edit Transaction
- Tap transaction → detail sheet appears
- Top-right: Edit button
- Edit any field, save updates in real-time
- Edit history logged in audit log

#### FR-TXN-004: Interest Calculation
- Optional per-transaction interest rate (%)
- Daily at 12:00 AM midnight: system job recalculates interest for all transactions with interest rate
- Interest is simple or compound (configurable in Admin settings, default: simple)
- Running balance updates daily
- Interest history viewable per transaction

#### FR-TXN-005: Upcoming Transactions
- Transactions with future dates remain in "Upcoming" tab
- At midnight on the scheduled date → auto-move to "Current" tab
- Notification sent when upcoming becomes current

#### FR-TXN-006: Transaction Filters
- Filter by: Date range, Amount range, Type (gave/got), Has Interest, Has Description

---

### 4.5 Shared Entries Module (Tab 2 — Download Icon)

#### FR-SHARED-001: View Shared Entries
- Shows all persons who created entries using the logged-in user's phone number
- View only — no editing allowed
- Same You Give / You Get summary card at top
- Linked user can see their running balance, transaction history

#### FR-SHARED-002: Real-time Sync
- When the person-owner edits a transaction → shared view updates in real-time
- When person is deleted (24h timer) → banner shown: "This account will be removed in X hours"

---

### 4.6 Notifications Module (Tab 3 — Bell Icon)

#### FR-NOTIF-001: Notification Categories
- **Transactions:** New entries added by others, upcoming → current transitions, balance updates
- **Support:** Replies from admin to support chat
- **Updates:** New app version available, release notes
- **Activation:** Account activation status (approved/rejected)
- **Announcements:** Admin broadcasts to all or selected users

#### FR-NOTIF-002: Notification Badge
- Red badge with count on Bell icon in pill nav
- Badge clears when notification page is opened

#### FR-NOTIF-003: Notification Actions
- Mark as read (individual or all)
- Delete notification
- Tap to deep-link to relevant page

#### FR-NOTIF-004: Push Notifications
- FCM-powered push notifications for Android and iOS
- Web push via browser Service Worker

---

### 4.7 Settings Module (Tab 4 — Gear Icon)

#### FR-SETTINGS-001: Profile Section
- Name (tap to edit via Apple popup modal)
- Phone Number (tap to edit)

#### FR-SETTINGS-002: App Preferences
- Dark Mode toggle (iOS 26-style toggle)
- PIN Lock enable/disable
- Biometric enable/disable
- Language (future)

#### FR-SETTINGS-003: User Manual
- In-app page with full documentation
- Navigation: Settings → User Manual → Full scrollable page

#### FR-SETTINGS-004: Support Chat
- Opens chat interface (iMessage-style)
- User types message, taps Send
- Admin sees in Admin Panel → Support Requests
- Chat is persistent and real-time

#### FR-SETTINGS-005: Updates
- Shows current version, available version, size in MB
- "What's New" section with release notes
- "Download & Install" button triggers download and auto-install (Android) or redirects to TestFlight (iOS)

#### FR-SETTINGS-006: Delete Account
- Apple-style confirmation dialog
- Two-step: "Are you sure?" → "Type DELETE to confirm"
- All user data soft-deleted (Admin can restore)

#### FR-SETTINGS-007: Admin-only Settings
- **Users:** List of all active users (Name + Phone + Delete button)
- **Pending Activations:** List with Approve (✓) / Reject (✗) actions
- **Support Requests:** All user chats, grouped by user
- **Analytics Dashboard:** Charts and stats
- **Announcement:** Send broadcast notifications

---

### 4.8 Reports Module

#### FR-REPORT-001: PDF Report Generation
- Per-person report generation
- Header: Credit Book logo + Report title + Date range
- Sections: Person info, Opening Balance, Transaction list, Interest summary, Closing Balance
- Footer: Generated on [date/time] | Page X of Y

#### FR-REPORT-002: CSV / Excel Export
- Export all transactions for a person in CSV or Excel format
- Filtered by date range

#### FR-REPORT-003: Date Range Presets
- Current Month
- Last Month
- Last 6 Months
- Last 1 Year
- Custom (from/to date picker)

---

### 4.9 Security Module

#### FR-SEC-001: Authentication Security
- bcrypt password hashing (minimum 12 rounds)
- JWT access tokens (15 min) + refresh tokens (30 days)
- Refresh token rotation

#### FR-SEC-002: Data Security
- All API communication over HTTPS
- Database fields encrypted at rest (AES-256)
- Audit logs for all CRUD operations

#### FR-SEC-003: Admin Controls
- Force logout any user
- Reset any user's password
- View all audit logs

---

### 4.10 Family Groups Module

#### FR-FAMILY-001: Group Creation
- Admin can create named family groups
- Assign users to groups
- Group-level visibility controls for shared entries

#### FR-FAMILY-002: Group Sharing
- Transactions can be made visible to specific groups
- Group analytics in Admin dashboard

---

### 4.11 Offline Mode

#### FR-OFFLINE-001: Android Offline
- All transactions stored locally in SQLite via Drift package
- Queue offline operations for sync
- Visual indicator when offline: "You are offline — changes will sync when connected"

#### FR-OFFLINE-002: iOS Offline
- Same as Android — Core Data / SQLite via Drift
- Automatic sync on reconnect

#### FR-OFFLINE-003: Conflict Resolution
- Server timestamp wins for conflicting records
- Soft-merge strategy: both versions logged, admin can manually resolve

---

## 5. Non-Functional Requirements

### 5.1 Performance
- API response time: < 300ms (P95)
- Page load: < 2 seconds (web)
- Real-time sync latency: < 500ms

### 5.2 Scalability
- Designed for 2–20 concurrent users (family scale)
- Horizontal scaling possible on Render

### 5.3 Reliability
- 99.5% uptime target (Render free tier limitations acknowledged)
- Automatic daily database backups
- Real-time backup to secondary location (Backblaze B2 free tier)

### 5.4 Security
- OWASP Top 10 compliance
- No sensitive data in logs
- All secrets in environment variables

### 5.5 Usability
- Apple Human Interface Guidelines compliance
- Minimum touch target: 44×44pt
- Accessible: VoiceOver compatible labels on all interactive elements
- Dark mode support throughout

### 5.6 Compatibility
- Android: API 26+ (Android 8.0+)
- iOS: iOS 16+
- Web: Chrome 100+, Safari 16+, Firefox 100+, Edge 100+

---

## 6. Constraints

| Constraint | Detail |
|-----------|--------|
| Budget | $0 — All free-tier services only |
| Distribution | No public app stores. APK sideload + web only |
| Users | Private family — estimated 2–10 users max |
| Hosting | Vercel (frontend) + Render free tier (backend) |
| Database | PostgreSQL on Render free tier (90-day data retention warning — use backup) |

---

## 7. Assumptions
1. Admin (Tarun Kumar) has access to a computer/server for deployment
2. Family members have Android or iOS devices
3. Internet is available for initial setup; offline mode handles temporary disconnection
4. SF Pro fonts are legally licensed for internal use
5. Firebase free tier is sufficient for push notifications at family scale

---

## 8. Risks

| Risk | Probability | Mitigation |
|------|------------|-----------|
| Render free tier sleep delay (15min) | High | Keep-alive ping every 14 min |
| PostgreSQL free tier 90-day limit | Medium | Daily backup to Backblaze |
| APK updates require manual distribution | Low | In-app updater downloads APK from hosted URL |
| iOS distribution without App Store | Medium | Use AltStore or enterprise certificate |

---

*Document end — SRS v1.0.0*
