# Credit Book — Antigravity Development Prompt
## For use in Antigravity Desktop App (Claude Opus 4.6 Thinking)
## Paste this ENTIRE prompt into the next Antigravity session

---

# CREDIT BOOK — COMPLETE PROJECT PROMPT

You are the complete software development team for **Credit Book**, a private family financial ledger application.

## Project Location
All project files are in: `C:\Projects\CreditBook\`
- `docs/` — All 30 documentation files (read these FIRST before touching any code)
- `SF Pro/` — SF Pro font files (all weights, Display + Text + Rounded)
- Reference images — Screenshots from Khatabook and Apple UI for design reference

## Critical First Step
**Before writing any code, READ these documents:**
1. `docs/00_Project_Summary_For_Confirmation.md` — Full spec summary
2. `docs/01_Software_Requirements_Specification.md` — Detailed requirements
3. `docs/03_Apple_Design_System.md` — Complete Apple design tokens, colors, typography
4. `docs/04_Database_Design.md` — Database schema
5. `docs/06_API_Documentation.md` — All API endpoints
6. `docs/07_Folder_Structure.md` — Exact folder structure to follow
7. `docs/24_Animation_Specification.md` — All animations
8. `docs/23_Design_Tokens.md` — All design tokens
9. `docs/19_Master_Development_Roadmap.md` — Development phases

## Current Phase: PHASE 5 — WEBSITE (Web Application)
Build the complete web application FIRST. Website must be perfect before mobile apps.

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Web Frontend | React + Vite (JavaScript/JSX) |
| Styling | Vanilla CSS with CSS custom properties (NO TailwindCSS) |
| State | Zustand (global) + React Query / TanStack Query (server state) |
| Routing | React Router v6 |
| HTTP | Axios |
| Charts | Recharts |
| PDF | jsPDF + jsPDF-autotable |
| WebSocket | Socket.IO client |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | bcrypt + JWT |
| Realtime | Socket.IO |
| Background Jobs | node-cron |
| Push | Firebase Admin SDK |
| Mobile | Flutter (later) |

---

## Design Rules (NON-NEGOTIABLE)

1. **Apple Human Interface Guidelines ONLY** — No Material Design
2. **SF Pro fonts** — Load from `public/fonts/` (copy from `C:\Projects\CreditBook\SF Pro\`)
3. **All colors via CSS custom properties** — Never hardcode hex values
4. **Light + Dark mode** — Both must work perfectly
5. **Spring animations** — `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring, `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for standard
6. **Minimum touch target: 44×44px** on all interactive elements
7. **Floating Apple pill** bottom navigation (frosted glass, 56px height, pill-shaped, centered)
8. **Translucent navigation bar** with blur

---

## Complete Color Token Reference

### Light Mode (`:root`)
```css
--color-blue: hsl(214, 100%, 50%);
--color-green: hsl(141, 71%, 38%);
--color-red: hsl(0, 100%, 42%);
--color-orange: hsl(28, 100%, 50%);
--bg-primary: hsl(0, 0%, 97%);
--bg-secondary: hsl(0, 0%, 100%);
--bg-tertiary: hsl(240, 6%, 94%);
--label-primary: hsl(0, 0%, 0%);
--label-secondary: hsla(0, 0%, 24%, 0.60);
--label-tertiary: hsla(0, 0%, 24%, 0.30);
--separator: hsla(0, 0%, 24%, 0.29);
--fill-primary: hsla(0, 0%, 47%, 0.20);
--fill-secondary: hsla(0, 0%, 47%, 0.16);
--fill-tertiary: hsla(0, 0%, 47%, 0.12);
--app-positive: hsl(141, 71%, 38%);   /* Money you'll receive — green */
--app-negative: hsl(0, 100%, 42%);    /* Money you owe — red */
--app-accent: hsl(214, 100%, 50%);    /* Primary tint — blue */
--shadow-sm: 0 2px 8px hsla(0,0%,0%,0.12);
--shadow-md: 0 4px 16px hsla(0,0%,0%,0.15);
--shadow-pill: 0 8px 40px hsla(0,0%,0%,0.25), 0 2px 8px hsla(0,0%,0%,0.15);
--radius-card: 13px;
--radius-sheet: 20px;
--radius-dialog: 14px;
--radius-pill: 9999px;
--space-4: 16px; --space-6: 24px;
```

### Dark Mode (`@media (prefers-color-scheme: dark)`)
```css
--bg-primary: hsl(0, 0%, 0%);
--bg-secondary: hsl(240, 5%, 11%);
--bg-tertiary: hsl(240, 4%, 16%);
--label-primary: hsl(0, 0%, 100%);
--label-secondary: hsla(0, 0%, 100%, 0.60);
--color-blue: hsl(214, 100%, 60%);
--color-green: hsl(141, 66%, 51%);
--color-red: hsl(0, 100%, 57%);
```

---

## App Structure (What to Build)

### Pages
1. **LoginPage** — `/login` — Phone + Password
2. **RegisterPage** — `/register` — Name + Phone + Password + Confirm
3. **HomePage** — `/` — Summary cards + person list + search
4. **PersonDetailPage** — `/persons/:id` — Transaction history for one person
5. **SharedEntriesPage** — `/shared` — View-only ledgers others made with your number
6. **NotificationsPage** — `/notifications` — All notification categories
7. **SettingsPage** — `/settings` — Profile, preferences, admin section
8. **UserManualPage** — `/settings/manual` — Full user guide
9. **SupportChatPage** — `/settings/support` — iMessage-style chat with admin
10. **AdminUsersPage** — `/admin/users`
11. **AdminPendingPage** — `/admin/pending`
12. **AdminSupportPage** — `/admin/support` — All user conversations

### Navigation
- Top navigation bar (translucent, blur, large title style)
- Floating pill bottom navigation (4 icons: Upload, Download, Bell, Gear)
- Badge numbers on Bell (notifications) and Gear (updates/alerts)

---

## Key Screens Spec

### Home Screen
```
Top Bar: [Logo + "Credit Book"] ---------- [🔍] [➕]
                                           (search animation on tap)
┌──────────────────┐  ┌──────────────────┐
│  You Give        │  │  You Get         │
│  ₹15,000         │  │  ₹8,500          │
│  (green text)    │  │  (red text)      │
└──────────────────┘  └──────────────────┘
Search: [Search persons...]
─────────────────────────────────────────
[Avatar] Ravi Kumar       ₹5,000 ›  (green)
[Avatar] Priya Kumar     -₹2,500 ›  (red)
[Avatar] Suresh               ₹0 ›
─────────────────────────────────────────
         [Pill Nav: ↑  ↓  🔔  ⚙]
```

### Person Detail Screen
```
← [Avatar] Ravi Kumar                     ⚙
┌────────────────────────────────────────┐
│ You will get    ₹5,000                 │
└────────────────────────────────────────┘
[Current]    [Upcoming]
─────────────────────────────────────────
┌────────────────────────────────────────┐
│ ₹500                         (green)  │
│ 01 Jul 26 • 07:44 AM                  │
│ Bal. ₹5,000                            │
│ Grocery money                          │
└────────────────────────────────────────┘
─────────────────────────────────────────
[YOU GAVE ₹]              [YOU GOT ₹]
  (red pill)                (green pill)
```

### Settings Screen
```
PROFILE
┌────────────────────────────────────────┐
│ Name              Tarun Kumar       ›  │
│ Phone           +91 98765 43210    ›  │
└────────────────────────────────────────┘
PREFERENCES
┌────────────────────────────────────────┐
│ Dark Mode                       [●  ] │
└────────────────────────────────────────┘
APP
┌────────────────────────────────────────┐
│ User Manual                         ›  │
│ Support Chat                    3   ›  │
│ Updates                         1   ›  │
└────────────────────────────────────────┘
ADMIN (admin only)
┌────────────────────────────────────────┐
│ Users                           8   ›  │
│ Pending Activations             2   ›  │
│ Support Requests                3   ›  │
│ Analytics Dashboard                 ›  │
│ Announcements                       ›  │
└────────────────────────────────────────┘
DANGER ZONE
┌────────────────────────────────────────┐
│ Delete Account                      ›  │
└────────────────────────────────────────┘
```

---

## Alerts / Dialogs

### Delete Confirmation (Apple Alert style)
```
╭─────────────────────────────╮
│       Delete Person?        │
│                             │
│  This will remove Ravi and  │
│  all their transactions.    │
│  The account will be        │
│  deleted in 24 hours.       │
│─────────────┬───────────────│
│   Cancel    │    Delete     │  
│  (blue)     │  (red, bold)  │
╰─────────────┴───────────────╯
```

### Info Alert (Apple style)
```
╭─────────────────────────────╮
│   Account Activation        │
│   Pending                   │
│                             │
│   Your account has been     │
│   created. Please contact   │
│   the admin to activate     │
│   your account.             │
│                             │
│           [ OK ]            │
╰─────────────────────────────╯
```

---

## Backend API (Build Simultaneously)

Create these endpoints in Node.js + Express:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET  /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET  /api/v1/persons` — user's own persons
- `POST /api/v1/persons`
- `GET  /api/v1/persons/shared` — others who used user's phone
- `GET  /api/v1/persons/:id`
- `PATCH /api/v1/persons/:id`
- `DELETE /api/v1/persons/:id` — schedule 24h delete
- `POST /api/v1/persons/:id/restore`
- `GET  /api/v1/persons/:id/transactions`
- `POST /api/v1/persons/:id/transactions`
- `PATCH /api/v1/persons/:id/transactions/:txnId`
- `DELETE /api/v1/persons/:id/transactions/:txnId`
- `GET  /api/v1/notifications`
- `GET  /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/read-all`
- `GET  /api/v1/support/messages`
- `POST /api/v1/support/messages`
- `GET  /api/v1/updates/check`
- `POST /api/v1/persons/:id/reports/pdf`
- Admin endpoints: users, pending, activate, reject, analytics, support

Full spec in: `docs/06_API_Documentation.md`

---

## Prisma Schema (PostgreSQL)

```prisma
// See docs/04_Database_Design.md for FULL schema
// Key tables:
model User {
  id          String   @id @default(uuid())
  name        String
  phone       String   @unique
  passwordHash String
  role        UserRole @default(user)
  status      UserStatus @default(pending)
  // ... see full schema in docs
}

model Person {
  id          String   @id @default(uuid())
  ownerId     String
  linkedUserId String?
  name        String
  phone       String?
  balance     Decimal  @default(0)
  deleteScheduledAt DateTime?
  // ...
}

model Transaction {
  id              String   @id @default(uuid())
  personId        String
  type            TransactionType
  amount          Decimal
  currentAmount   Decimal
  description     String?
  interestRate    Decimal?
  transactionDate DateTime @default(now())
  status          TransactionStatus @default(current)
  // ...
}
```

---

## Build Order for This Session

1. **Create project structure** (apps/web, apps/api, packages)
2. **Backend first:**
   - Express + Prisma setup
   - Database migrations
   - Auth endpoints (register, login, refresh)
   - Persons CRUD endpoints
   - Transactions CRUD endpoints
   - Notifications endpoints
3. **Web frontend:**
   - CSS design tokens (tokens.css)
   - SF Pro font loading (typography.css)
   - Global styles + animations (global.css, animations.css)
   - Base components (Button, TextField, Avatar, Toggle, Card, Alert, BottomSheet)
   - Layout (NavigationBar, PillTabBar, Screen)
   - Auth pages (Login, Register)
   - Home page (with search animation, summary cards, person list)
   - Person detail page (transactions, current/upcoming, add buttons)
   - Shared Entries page
   - Notifications page
   - Settings page (all sections including admin)
   - Support Chat page (iMessage style)
4. **Connect frontend to backend**
5. **Real-time with Socket.IO**
6. **Test all features**

---

## Important Reminders

- Run `npm run dev` for development (NOT `npm run build`)
- Web runs on Vite dev server
- API runs on Node.js with ts-node or tsx
- All environment variables in `.env` files (NEVER commit to git)
- Admin phone number: set in `ADMIN_PHONE` env var (the user will tell you their number)
- Default admin password: set in `ADMIN_PASSWORD` env var

## User Confirmed
- Build website first, app later
- All free technologies only
- Apple design everywhere — not Material Design
- Private family use only

---

*End of Antigravity prompt. Paste this entire document into the next session.*
