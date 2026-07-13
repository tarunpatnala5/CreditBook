# Credit Book — Complete Project Summary
## (Structured Confirmation for User Review)
**Date:** 2026-07-13  
**Prepared by:** Antigravity (AI Development Partner)

---

## ✅ What You Asked For — Confirmed

### 1. Application Name
**Credit Book** (your choice approved — clean, descriptive, professional)

---

### 2. Platforms

| Platform | Distribution Method | Status |
|---------|-------------------|--------|
| Android | APK sideload (private, no Play Store) | ✅ Confirmed |
| iOS | TestFlight / AltStore (private, no App Store) | ✅ Confirmed |
| Desktop Website | Vercel deployment | ✅ Confirmed |
| Mobile Website | Vercel (responsive) | ✅ Confirmed |
| Backend | Render (free tier) | ✅ Confirmed |

---

### 3. Technology Stack (All Free)

| Component | Technology | Cost |
|-----------|-----------|------|
| Web Frontend | React + Vite | Free |
| Mobile App | Flutter (Android + iOS from one codebase) | Free |
| Backend API | Node.js + Express + TypeScript | Free |
| Database | PostgreSQL on Render | Free |
| Realtime | Socket.IO | Free |
| Push Notifications | Firebase FCM | Free |
| Hosting (Frontend) | Vercel | Free |
| Hosting (Backend) | Render | Free |
| Backup Storage | Backblaze B2 | Free |
| Fonts | SF Pro (your local files) | Already owned |

---

### 4. App Design
- **Apple Human Interface Guidelines** — everything looks and feels like a native iOS/macOS app
- **SF Pro fonts** — loaded from your local `SF Pro/` folder
- **Light and Dark mode** — follows system preference + manual toggle
- **Floating Apple Pill** bottom navigation (iOS 26 Music-style)
- **Spring animations** — same physics Apple uses
- **No Material Design, no Android UI**

---

### 5. Top Navigation Bar (Home Screen)
- Left: App Logo + "Credit Book" wordmark
- Right: 🔍 Search icon + ➕ Plus button
- **Search animation:** logo + plus fade out → search field slides in (Apple spring animation) → × to close → everything slides back

---

### 6. Bottom Navigation — Floating Pill (4 icons, no labels)

| Position | Icon | Page | Badge |
|---------|------|------|-------|
| 1st | Upload ↑ (Samsung Quick Share style) | My Entries (Tab 1) | None |
| 2nd | Download ↓ (Samsung Quick Share style) | Shared Entries (Tab 2) | None |
| 3rd | Bell 🔔 | Notifications (Tab 3) | ● red count |
| 4th | Gear ⚙ | Settings (Tab 4) | ● for updates/notifs |

---

### 7. Tab 1 — My Entries (Upload icon)
- Your personal ledger — accounts YOU created
- Fully editable
- Shows "You Give" / "You Get" summary cards at top
- List of all persons you've added
- Tap person → go to their transaction page

---

### 8. Tab 2 — Shared Entries (Download icon)
- Shows persons that OTHER PEOPLE created using YOUR phone number
- **View only** — you cannot edit
- Same "You Give" / "You Get" summary
- When they add/edit a transaction, you see it in real-time

---

### 9. Tab 3 — Notifications (Bell icon)
- All notifications with categories:
  - Transactions
  - Support
  - Updates
  - Activation
  - Announcements
- Tap → goes to relevant page
- Badge: unread count

---

### 10. Tab 4 — Settings (Gear icon)

**For all users:**
- Name (tap to edit — Apple popup modal with Save/Cancel)
- Phone Number (tap to edit)
- Dark Mode (iOS 26-style toggle)
- User Manual (opens full in-app guide)
- Support Chat (iMessage-style chat with admin)
- Updates (shows version, size, what's new, download button)
- Delete Account (requires typing "DELETE", confirmation dialog)

**Admin-only (below Delete Account):**
- Users (list of active users, newest first, delete button per user)
- Pending Activations (name + phone + ✓ approve + ✗ reject, with spinning animation during process)
- Support Requests (all user chats, grouped like WhatsApp)
- Analytics Dashboard (charts, stats)
- Announcements

---

### 11. Adding a New Person (Plus button)
- Apple bottom sheet slides up
- Name (required) + Phone number (optional but important)
- On save: person created in database
- If phone number matches an existing Credit Book user → **linked automatically**
- That user sees your entries in their Shared Entries tab

---

### 12. Person Detail Page
**Header:**
- ← Back button
- Avatar (colored initials circle) + Name
- ⚙ Settings icon (opens sheet with: Edit Name, Edit Phone, Download Report, Delete)

**Balance Card:**
- "You will give ₹X" or "You will get ₹X" — current net balance

**Pill Tabs:**
- **Current** — active transactions
- **Upcoming** — future-dated transactions

**Transaction List:**
- Each card shows: Amount (large, colored) → Date & Time → Running Balance → Description

**Bottom Buttons:**
- 🔴 **YOU GAVE ₹** — you gave money to this person
- 🟢 **YOU GOT ₹** — you received money from this person

---

### 13. Creating a Transaction
A bottom sheet slides up with:
- **Amount** (required)
- **Description** (optional)
- **Date/Time** (default: now; change for upcoming)
- **Interest %** (optional)

If date is **future** → goes to Upcoming tab automatically.  
At midnight on that date → moves to Current automatically + notification sent.

---

### 14. Interest
- Optional per-transaction interest rate (%)
- Calculated daily at midnight
- Simple interest by default
- Tap transaction to see: Original Amount, Description, Current Amount (with accumulated interest)
- Edit button (top right of detail view)

---

### 15. Transaction Detail & Edit
- Tap any transaction → detail sheet (Apple bottom sheet)
- View: Original amount, description, current amount (with interest)
- **Edit button** top right → edit mode → change anything → save
- Changes reflected in real-time

---

### 16. Person Delete — 24-Hour Timer
When you delete a person:
- They're not immediately deleted
- 24-hour countdown timer starts
- The linked user (who had that person's number) sees: "This account will be deleted in X hours" (small text below their name in Shared Entries)
- After 24 hours: person fully removed from both sides
- Undo available during the 24-hour window

---

### 17. Download Report (from ⚙ icon on person page)
- Choose: Current Month / Last Month / Last 6 Months / Last 1 Year / Custom dates
- Choose format: PDF / CSV / Excel
- PDF includes: Credit Book logo, person name, date range, opening balance, all transactions (date, amount, description, balance), interest summary, closing balance, generation date

---

### 18. Support Chat
**User side:** iMessage-style chat. Type, tap Send. Wait for admin reply. Notification when admin replies.

**Admin side:**
- Settings → Support Requests (with count badge)
- See all user conversations (WhatsApp list style)
- Open any conversation → see user messages → reply → user notified

---

### 19. Updates
- Settings → Updates (count badge if update available)
- Shows: version number, size in MB, what's new (release notes)
- **Download & Install** button (Android: auto-installs APK | iOS: opens TestFlight)
- Admin publishes new version from Admin Panel → all users notified

---

### 20. Registration & Login
**Register:**
- Name, Phone (mandatory), Password, Confirm Password
- After submit: popup → "Contact admin for account activation"
- Cannot log in until admin activates

**Login:**
- Phone + Password
- If pending: shows error "Account pending activation"

**Admin activation:**
- Settings → Pending Activations
- ✓ Approve or ✗ Reject (with spinning animation)
- Approved users notified instantly

---

### 21. Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens (15-min access + 30-day refresh, with rotation)
- All HTTPS
- Audit log for every action
- Optional PIN Lock + Fingerprint/Face Unlock on mobile

---

### 22. Offline Mode (Android + iOS)
- App works without internet
- Shows banner: "You are offline — changes will sync when connected"
- Create transactions offline → queued locally → auto-sync when online
- "Synced X items" confirmation when reconnected

---

### 23. Popups/Dialogs (Apple Style)
- **Yes/No confirmation** (like delete): horizontal split buttons, like iOS alert (blur backdrop, 14px radius, Cancel + Destructive action)
- **Message/info popup**: centered card with icon, message, single "OK" button
- **Edit modal**: bottom sheet (not a dialog) with fields, Save (blue) + Cancel

---

### 24. Database & Backup
- PostgreSQL (Render free tier)
- Soft delete everywhere (nothing permanently deleted immediately)
- Daily backup at 2 AM → compressed → uploaded to Backblaze B2 (free tier, 10GB)
- 30-day backup retention
- Recycle Bin in Admin Panel for restoring soft-deleted records

---

### 25. Build First: Website
As requested — **Website first**, then after bugs are cleared → Android APK → iOS.

---

## 26. Naming Suggestion

Your name **Credit Book** is clear and works well. If you want alternatives:

| Name | Feel |
|------|------|
| **Credit Book** | ✅ Your choice — simple, professional |
| **LedgerMate** | Professional, sounds like a product |
| **TrustLedger** | Emphasizes family trust |
| **FamilyKhata** | Familiar (khata = ledger in Hindi) |
| **MyKhata** | Personal, familiar |

**Recommendation:** Keep **Credit Book** — it's clean and professional.

---

*This document confirms everything discussed. Please review and confirm before development begins.*
