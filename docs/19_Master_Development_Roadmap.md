# Credit Book — Master Development Roadmap
**Version:** 1.0.0  
**Date:** 2026-07-13  
**Total Estimated Development Time:** 8–12 weeks (1 developer)

---

## Phase Overview

| Phase | Name | Duration | Status |
|-------|------|----------|--------|
| 0 | Documentation | 1 day | ✅ Complete |
| 1 | Architecture Setup | 2 days | ⬜ Pending |
| 2 | Backend Foundation | 5 days | ⬜ Pending |
| 3 | Database + Migrations | 2 days | ⬜ Pending |
| 4 | Authentication | 3 days | ⬜ Pending |
| 5 | Website (Web App) | 10 days | ⬜ Pending |
| 6 | Android App (Flutter) | 7 days | ⬜ Pending |
| 7 | iOS App | 3 days | ⬜ Pending |
| 8 | Realtime Features | 3 days | ⬜ Pending |
| 9 | Support Chat | 2 days | ⬜ Pending |
| 10 | Notifications | 2 days | ⬜ Pending |
| 11 | Update System | 2 days | ⬜ Pending |
| 12 | Analytics | 2 days | ⬜ Pending |
| 13 | Testing | 5 days | ⬜ Pending |
| 14 | Optimization | 2 days | ⬜ Pending |
| 15 | Deployment | 2 days | ⬜ Pending |

---

## Phase 1: Architecture Setup (Week 1, Days 1-2)

### Goals
- Set up monorepo structure
- Configure all tooling
- Establish development environment

### Tasks
- [ ] Initialize monorepo with npm workspaces
- [ ] Create `apps/web`, `apps/api`, `apps/mobile` directories
- [ ] Set up `packages/shared-types`
- [ ] Configure ESLint + Prettier (web + api)
- [ ] Configure TypeScript for web and api
- [ ] Set up Vite for web app
- [ ] Initialize Flutter project
- [ ] Set up Git repository with `.gitignore`
- [ ] Create `.env.example` files
- [ ] Set up GitHub repository (private)
- [ ] Write README.md with setup instructions

### Deliverable
- Empty but properly structured monorepo that builds without errors

---

## Phase 2: Backend Foundation (Week 1, Days 3-7)

### Goals
- Working Express API with all routes defined
- Middleware stack complete

### Tasks
- [ ] Initialize Node.js + Express project with TypeScript
- [ ] Set up Prisma ORM with PostgreSQL connection
- [ ] Configure Helmet, CORS, body-parser, compression
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Create request logging middleware (Winston + Morgan)
- [ ] Create global error handler middleware
- [ ] Create standard response format utilities
- [ ] Set up Redis connection (for session caching)
- [ ] Define all route files (stub handlers)
- [ ] Set up node-cron for background jobs
- [ ] Implement health check endpoint
- [ ] Set up keep-alive job (Render free tier)
- [ ] Write basic API tests setup (Jest + Supertest)

### Deliverable
- API server running on localhost with all routes returning 501 Not Implemented

---

## Phase 3: Database + Migrations (Week 2, Days 1-2)

### Goals
- Complete database schema deployed
- Seed data for development

### Tasks
- [ ] Write complete Prisma schema (`schema.prisma`)
- [ ] Create initial migration
- [ ] Create all indexes (per Database Design doc)
- [ ] Create balance update trigger (PostgreSQL)
- [ ] Write database seeder (admin user, sample data)
- [ ] Test all foreign key relationships
- [ ] Set up Prisma Studio for development
- [ ] Document migration commands in README

### Deliverable
- PostgreSQL database with all tables, indexes, and triggers deployed

---

## Phase 4: Authentication (Week 2, Days 3-5)

### Goals
- Complete auth system working end-to-end

### Tasks
- [ ] Implement user registration endpoint
- [ ] Implement user login endpoint
- [ ] Implement JWT issuance (access + refresh tokens)
- [ ] Implement refresh token rotation
- [ ] Implement logout (revoke session)
- [ ] Implement logout all devices
- [ ] Create auth middleware (verifyToken)
- [ ] Create adminOnly middleware
- [ ] Implement password hashing with bcrypt
- [ ] Implement admin: list pending users
- [ ] Implement admin: activate user
- [ ] Implement admin: reject user
- [ ] Implement admin: delete user
- [ ] Write auth service unit tests
- [ ] Write auth route integration tests

### Deliverable
- Complete authentication system. Admin can log in, create users, activate them.

---

## Phase 5: Website (Week 3-4, 10 days)

### Priority: Website first, app second (per user request)

### Week 3: Foundation + Auth + Home

**Days 1-2: Design System**
- [ ] Copy SF Pro fonts to `public/fonts/`
- [ ] Write `tokens.css` (all design tokens)
- [ ] Write `typography.css` (all font-face declarations + type scale)
- [ ] Write `animations.css` (all keyframes)
- [ ] Write `global.css` (resets, base styles)
- [ ] Build base UI components: Button, TextField, Avatar, Badge, Toggle, Spinner
- [ ] Build layout components: Screen, NavigationBar, PillTabBar

**Days 3-4: Authentication Pages**
- [ ] Build Login page (Apple design)
- [ ] Build Register page
- [ ] Implement Axios client with interceptors
- [ ] Implement auth store (Zustand)
- [ ] Connect login/register to API
- [ ] Implement token refresh on API calls
- [ ] Implement protected routes
- [ ] Build PIN Lock screen

**Days 5-7: Home Screen + Persons**
- [ ] Build home page layout
- [ ] Build Summary Cards (You Give / You Get)
- [ ] Build Person list with Apple grouped style
- [ ] Build person row with avatar + balance
- [ ] Build search animation (expand/collapse)
- [ ] Build Add Person bottom sheet
- [ ] Connect to API (GET /persons, POST /persons)
- [ ] Implement edit + delete person flows
- [ ] Implement 24-hour delete countdown UI

### Week 4: Transactions + Settings + Admin

**Days 1-3: Person Detail + Transactions**
- [ ] Build Person detail page
- [ ] Build transaction list (Current + Upcoming tabs)
- [ ] Build transaction card (amount + date + balance)
- [ ] Build Add Transaction bottom sheet (amount, description, date, interest)
- [ ] Build transaction detail modal (view + edit)
- [ ] Connect to API (GET/POST/PATCH/DELETE transactions)
- [ ] Implement real-time balance update (via polling initially)

**Days 4-5: Shared Entries + Notifications**
- [ ] Build Shared Entries page (Tab 2)
- [ ] Build Notifications page (Tab 3)
- [ ] Build notification list with categories
- [ ] Implement mark as read / delete notification

**Days 6-7: Settings + Admin**
- [ ] Build Settings page with all sections
- [ ] Build profile edit modals (name, phone)
- [ ] Build dark mode toggle (functional)
- [ ] Build User Manual page (render markdown)
- [ ] Build Admin: Users page
- [ ] Build Admin: Pending Activations page
- [ ] Build Admin: Analytics dashboard
- [ ] Build Updates sheet
- [ ] Build Delete Account flow

### Phase 5 Deliverable
- Fully functional web application. All CRUD operations working. Deployed to Vercel.

---

## Phase 6: Android App (Flutter) (Week 5-6, 7 days)

### Tasks
- [ ] Set up Flutter project with GoRouter, Riverpod, Dio
- [ ] Configure Drift (SQLite) for offline storage
- [ ] Implement Apple design tokens in Dart
- [ ] Build all shared widgets (apple_bottom_sheet, apple_dialog, etc.)
- [ ] Build Apple pill tab bar
- [ ] Build authentication screens (Login, Register, PIN Lock)
- [ ] Build Home screen with summary cards and person list
- [ ] Build Person detail with transactions
- [ ] Build Shared Entries screen
- [ ] Build Notifications screen
- [ ] Build Settings screen (full)
- [ ] Build Admin screens
- [ ] Implement offline mode with Drift + sync queue
- [ ] Configure FCM for push notifications
- [ ] Configure biometric authentication
- [ ] Build in-app update downloader
- [ ] Test on Android device
- [ ] Generate signed APK

### Phase 6 Deliverable
- Signed Android APK ready for sideloading

---

## Phase 7: iOS App (Week 7, Days 1-3)

### Tasks
- [ ] Configure iOS Runner (Info.plist, capabilities)
- [ ] Configure FCM for iOS (APNs setup)
- [ ] Configure biometric (Face ID) permissions
- [ ] Test all screens on iOS simulator
- [ ] Test on physical iOS device
- [ ] Build IPA for TestFlight

### Phase 7 Deliverable
- iOS build ready for TestFlight distribution

---

## Phase 8: Realtime Features (Week 7, Days 4-6)

### Tasks
- [ ] Set up Socket.IO on backend
- [ ] Implement real-time balance updates
- [ ] Implement real-time notification delivery
- [ ] Implement support chat real-time messages
- [ ] Implement typing indicators
- [ ] Integrate WebSocket in React web app
- [ ] Integrate WebSocket in Flutter
- [ ] Test with multiple concurrent users
- [ ] Implement offline queue for WebSocket messages

---

## Phase 9: Support Chat (Week 7, Day 7)

### Tasks
- [ ] Complete support chat API endpoints
- [ ] Build iMessage-style chat UI (web)
- [ ] Build iMessage-style chat UI (Flutter)
- [ ] Build admin conversation list
- [ ] Implement read receipts
- [ ] Test end-to-end chat flow

---

## Phase 10: Notifications (Week 8, Days 1-2)

### Tasks
- [ ] Set up Firebase Admin SDK
- [ ] Implement FCM push for Android
- [ ] Implement APNs push for iOS
- [ ] Implement web push with Service Worker
- [ ] Test push notifications on all platforms
- [ ] Implement badge count management
- [ ] Test announcement broadcasts

---

## Phase 11: Update System (Week 8, Days 3-4)

### Tasks
- [ ] Build admin update publishing UI
- [ ] Build user update UI (Settings → Updates)
- [ ] Implement APK download + install (Android)
- [ ] Implement update check API
- [ ] Implement update notification
- [ ] Test update flow end-to-end

---

## Phase 12: Analytics (Week 8, Days 5-6)

### Tasks
- [ ] Build analytics service (aggregate queries)
- [ ] Build analytics dashboard UI (web)
- [ ] Build analytics dashboard (Flutter admin)
- [ ] Implement charts (Recharts for web, fl_chart for Flutter)
- [ ] Test with sample data

---

## Phase 13: Testing (Week 9)

### Tasks
- [ ] Write unit tests: all service functions (API)
- [ ] Write integration tests: all API routes
- [ ] Write widget tests: critical Flutter screens
- [ ] Write E2E tests: auth flow, transaction flow
- [ ] Manual testing checklist (see `17_Testing_Checklist.md`)
- [ ] Performance testing (load test API)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile device testing (multiple Android devices)
- [ ] Dark mode testing
- [ ] Offline mode testing

---

## Phase 14: Optimization (Week 10, Days 1-2)

### Tasks
- [ ] Analyze and reduce bundle size (web)
- [ ] Implement React.lazy() for all routes
- [ ] Optimize database queries (add missing indexes)
- [ ] Implement Redis caching for frequently accessed data
- [ ] Optimize Flutter app size (--split-debug-info)
- [ ] Compress all images
- [ ] Audit accessibility (VoiceOver, screen readers)

---

## Phase 15: Deployment (Week 10, Days 3-5)

### Tasks
- [ ] Configure Vercel for web frontend
- [ ] Configure Render for backend + database
- [ ] Set up all environment variables in production
- [ ] Run database migrations in production
- [ ] Seed admin user in production
- [ ] Configure UptimeRobot for keep-alive
- [ ] Set up Backblaze B2 bucket
- [ ] Test backup job
- [ ] Configure custom domain (if any)
- [ ] Final end-to-end testing in production
- [ ] Distribute APK to family members
- [ ] Distribute TestFlight invite to iOS users
- [ ] Write deployment guide (already in docs/18)

### Phase 15 Deliverable
- Credit Book is live and accessible to the family

---

## Review Points

After Phase 5 (Website complete): Full review of design, UX, and functionality  
After Phase 7 (iOS complete): Full review of mobile experience  
After Phase 13 (Testing): Bug fix sprint before deployment  
After Phase 15 (Live): Week 1 monitoring and quick-fix sprint

---

*Credit Book Master Development Roadmap — v1.0.0*
