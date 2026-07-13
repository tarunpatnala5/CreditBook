# Credit Book — Folder Structure
**Version:** 1.0.0  
**Date:** 2026-07-13  
**Technology Stack:** React (Vite) + Node.js + Flutter + PostgreSQL

---

## 1. Root Monorepo Structure

```
CreditBook/
├── apps/
│   ├── web/                    # React + Vite web application
│   ├── api/                    # Node.js + Express backend
│   └── mobile/                 # Flutter mobile app (Android + iOS)
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   └── shared-utils/           # Shared utility functions
├── docs/                       # All 30 documentation files
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
├── .gitignore
├── package.json                # Root package.json (npm workspaces)
└── README.md
```

---

## 2. Web Application (`apps/web/`)

```
apps/web/
├── public/
│   ├── fonts/                  # SF Pro font files (copied from CreditBook/SF Pro/)
│   │   ├── SF-Pro-Display-Regular.otf
│   │   ├── SF-Pro-Display-Medium.otf
│   │   ├── SF-Pro-Display-Semibold.otf
│   │   ├── SF-Pro-Display-Bold.otf
│   │   ├── SF-Pro-Text-Regular.otf
│   │   ├── SF-Pro-Text-Medium.otf
│   │   ├── SF-Pro-Text-Semibold.otf
│   │   ├── SF-Pro-Rounded-Regular.otf
│   │   └── SF-Pro-Rounded-Semibold.otf
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── favicon.ico
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker (offline + push)
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/              # SVG icons (SF Symbol equivalents)
│   ├── components/
│   │   ├── ui/                 # Base design system components
│   │   │   ├── Button.jsx
│   │   │   ├── Toggle.jsx
│   │   │   ├── TextField.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── BottomSheet.jsx
│   │   │   ├── Dialog.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Separator.jsx
│   │   │   ├── SectionHeader.jsx
│   │   │   ├── ListRow.jsx
│   │   │   └── index.js        # Re-exports all
│   │   ├── layout/
│   │   │   ├── NavigationBar.jsx
│   │   │   ├── PillTabBar.jsx
│   │   │   ├── Screen.jsx
│   │   │   ├── PageTransition.jsx
│   │   │   └── SafeArea.jsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── PinLockScreen.jsx
│   │   │   ├── home/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── PersonList.jsx
│   │   │   │   ├── PersonRow.jsx
│   │   │   │   └── SearchOverlay.jsx
│   │   │   ├── persons/
│   │   │   │   ├── PersonHeader.jsx
│   │   │   │   ├── AddPersonSheet.jsx
│   │   │   │   ├── EditPersonModal.jsx
│   │   │   │   └── PersonSettingsSheet.jsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionCard.jsx
│   │   │   │   ├── TransactionDetail.jsx
│   │   │   │   ├── AddTransactionSheet.jsx
│   │   │   │   ├── EditTransactionModal.jsx
│   │   │   │   ├── CurrentUpcomingToggle.jsx
│   │   │   │   └── InterestBadge.jsx
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationList.jsx
│   │   │   │   ├── NotificationItem.jsx
│   │   │   │   └── NotificationCategoryFilter.jsx
│   │   │   ├── settings/
│   │   │   │   ├── ProfileSection.jsx
│   │   │   │   ├── PreferencesSection.jsx
│   │   │   │   ├── AdminSection.jsx
│   │   │   │   ├── UserList.jsx
│   │   │   │   ├── PendingUserList.jsx
│   │   │   │   └── UpdatesSheet.jsx
│   │   │   ├── support/
│   │   │   │   ├── ChatView.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   └── AdminConversationList.jsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportSheet.jsx
│   │   │   │   └── DateRangePicker.jsx
│   │   │   └── analytics/
│   │   │       ├── AnalyticsDashboard.jsx
│   │   │       ├── StatsCard.jsx
│   │   │       └── ChartWrapper.jsx
│   │   └── shared/
│   │       ├── OfflineBanner.jsx
│   │       ├── ErrorBoundary.jsx
│   │       └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── home/
│   │   │   └── HomePage.jsx
│   │   ├── persons/
│   │   │   └── PersonDetailPage.jsx
│   │   ├── shared-entries/
│   │   │   └── SharedEntriesPage.jsx
│   │   ├── notifications/
│   │   │   └── NotificationsPage.jsx
│   │   ├── settings/
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── UserManualPage.jsx
│   │   │   └── SupportChatPage.jsx
│   │   └── admin/
│   │       ├── AdminUsersPage.jsx
│   │       ├── AdminPendingPage.jsx
│   │       ├── AdminSupportPage.jsx
│   │       └── AdminAnalyticsPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePersons.js
│   │   ├── useTransactions.js
│   │   ├── useNotifications.js
│   │   ├── useSupport.js
│   │   ├── useWebSocket.js
│   │   ├── useOnlineStatus.js
│   │   ├── useDarkMode.js
│   │   ├── usePinLock.js
│   │   └── useDebounce.js
│   ├── store/
│   │   ├── index.js             # Zustand store root
│   │   ├── authStore.js
│   │   ├── personStore.js
│   │   ├── transactionStore.js
│   │   ├── notificationStore.js
│   │   ├── supportStore.js
│   │   ├── settingsStore.js
│   │   └── offlineStore.js
│   ├── api/
│   │   ├── client.js            # Axios instance with interceptors
│   │   ├── auth.js
│   │   ├── persons.js
│   │   ├── transactions.js
│   │   ├── notifications.js
│   │   ├── support.js
│   │   ├── updates.js
│   │   ├── reports.js
│   │   ├── analytics.js
│   │   └── groups.js
│   ├── utils/
│   │   ├── formatters.js        # Currency, date, time formatting
│   │   ├── validators.js        # Form validation rules
│   │   ├── avatarColor.js       # Deterministic avatar color from name
│   │   ├── haptics.js           # Haptic feedback (web vibration API)
│   │   ├── storage.js           # LocalStorage wrapper
│   │   ├── offline.js           # Offline queue manager
│   │   └── logger.js            # Client-side logger
│   ├── styles/
│   │   ├── tokens.css           # Design tokens (CSS custom properties)
│   │   ├── typography.css       # Font definitions and type scale
│   │   ├── animations.css       # All keyframe animations
│   │   ├── components.css       # Base component styles
│   │   ├── layout.css           # Grid and layout utilities
│   │   ├── dark-mode.css        # Dark mode overrides
│   │   └── global.css           # Global resets + root styles
│   ├── router/
│   │   └── index.jsx            # React Router v6 configuration
│   ├── constants/
│   │   ├── routes.js
│   │   ├── queryKeys.js         # React Query cache keys
│   │   └── config.js            # App configuration constants
│   ├── App.jsx
│   ├── main.jsx
│   └── vite-env.d.ts
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .env.local
└── vercel.json
```

---

## 3. Backend API (`apps/api/`)

```
apps/api/
├── src/
│   ├── config/
│   │   ├── database.js         # Prisma client + connection
│   │   ├── redis.js            # Redis client
│   │   ├── firebase.js         # Firebase Admin SDK
│   │   ├── cors.js             # CORS configuration
│   │   └── env.js              # Environment variable validation (zod)
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   ├── adminOnly.js        # Admin role check
│   │   ├── rateLimiter.js      # Rate limiting (express-rate-limit)
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── requestLogger.js    # Request logging
│   │   ├── validate.js         # Request body validation (zod)
│   │   └── notFound.js         # 404 handler
│   ├── routes/
│   │   ├── index.js            # Route registration
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── persons.routes.js
│   │   ├── transactions.routes.js
│   │   ├── notifications.routes.js
│   │   ├── support.routes.js
│   │   ├── updates.routes.js
│   │   ├── reports.routes.js
│   │   ├── analytics.routes.js
│   │   ├── groups.routes.js
│   │   └── pushTokens.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── persons.controller.js
│   │   ├── transactions.controller.js
│   │   ├── notifications.controller.js
│   │   ├── support.controller.js
│   │   ├── updates.controller.js
│   │   ├── reports.controller.js
│   │   ├── analytics.controller.js
│   │   ├── groups.controller.js
│   │   └── pushTokens.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── users.service.js
│   │   ├── persons.service.js
│   │   ├── transactions.service.js
│   │   ├── notifications.service.js
│   │   ├── push.service.js         # FCM push notifications
│   │   ├── support.service.js
│   │   ├── updates.service.js
│   │   ├── reports.service.js      # PDF/CSV/Excel generation
│   │   ├── analytics.service.js
│   │   ├── groups.service.js
│   │   ├── interest.service.js     # Interest calculation logic
│   │   ├── backup.service.js       # Database backup to Backblaze
│   │   └── audit.service.js        # Audit log writer
│   ├── jobs/
│   │   ├── scheduler.js            # node-cron job scheduler
│   │   ├── interestCalc.job.js     # Daily interest calculation
│   │   ├── upcomingMover.job.js    # Move upcoming to current
│   │   ├── personDelete.job.js     # Finalize soft deletes
│   │   ├── backup.job.js           # Daily database backup
│   │   ├── sessionCleanup.job.js   # Remove expired sessions
│   │   └── keepAlive.job.js        # Ping self to prevent sleep
│   ├── websocket/
│   │   ├── index.js                # Socket.IO setup
│   │   ├── handlers/
│   │   │   ├── connection.js
│   │   │   ├── support.handler.js
│   │   │   └── notification.handler.js
│   │   └── emitters.js             # Helper functions to emit events
│   ├── validators/
│   │   ├── auth.validator.js       # Zod schemas for auth routes
│   │   ├── persons.validator.js
│   │   ├── transactions.validator.js
│   │   └── ...
│   ├── utils/
│   │   ├── jwt.js                  # JWT sign/verify helpers
│   │   ├── password.js             # bcrypt helpers
│   │   ├── response.js             # Standard response formatters
│   │   ├── logger.js               # Winston logger
│   │   ├── errors.js               # Custom error classes
│   │   └── pagination.js           # Pagination helpers
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma schema
│   │   ├── migrations/             # Auto-generated migrations
│   │   └── seed.js                 # Database seeder (admin user)
│   └── app.js                      # Express app setup
├── server.js                        # Entry point
├── package.json
├── .env.example
├── .env
└── render.yaml                      # Render deployment config
```

---

## 4. Flutter Mobile App (`apps/mobile/`)

```
apps/mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart                     # App root widget + theme
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart      # Design tokens (Dart)
│   │   │   ├── app_typography.dart  # SF Pro text styles
│   │   │   ├── app_spacing.dart     # Spacing constants
│   │   │   ├── app_radius.dart      # Border radius constants
│   │   │   └── app_animations.dart  # Animation durations/curves
│   │   ├── themes/
│   │   │   ├── app_theme.dart       # ThemeData (light + dark)
│   │   │   ├── light_theme.dart
│   │   │   └── dark_theme.dart
│   │   ├── router/
│   │   │   ├── app_router.dart      # GoRouter setup
│   │   │   └── routes.dart          # Route names/paths
│   │   ├── network/
│   │   │   ├── api_client.dart      # Dio HTTP client
│   │   │   ├── interceptors/
│   │   │   │   ├── auth_interceptor.dart
│   │   │   │   └── error_interceptor.dart
│   │   │   └── api_endpoints.dart
│   │   ├── storage/
│   │   │   ├── secure_storage.dart  # flutter_secure_storage (tokens/PIN)
│   │   │   ├── local_database.dart  # Drift (SQLite) for offline
│   │   │   └── preferences.dart     # SharedPreferences (settings)
│   │   ├── services/
│   │   │   ├── auth_service.dart
│   │   │   ├── offline_sync_service.dart
│   │   │   ├── push_service.dart    # FCM integration
│   │   │   ├── biometric_service.dart
│   │   │   └── websocket_service.dart
│   │   └── utils/
│   │       ├── formatters.dart
│   │       ├── validators.dart
│   │       ├── avatar_color.dart
│   │       └── haptics.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── auth_repository.dart
│   │   │   │   └── auth_dto.dart
│   │   │   ├── domain/
│   │   │   │   ├── auth_state.dart
│   │   │   │   └── user_model.dart
│   │   │   ├── presentation/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── pin_lock_screen.dart
│   │   │   └── auth_provider.dart   # Riverpod provider
│   │   ├── home/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │       ├── home_screen.dart
│   │   │       ├── widgets/
│   │   │       │   ├── summary_cards.dart
│   │   │       │   ├── person_list.dart
│   │   │       │   ├── person_row.dart
│   │   │       │   └── search_overlay.dart
│   │   │       └── home_provider.dart
│   │   ├── persons/          # [similar structure]
│   │   ├── transactions/     # [similar structure]
│   │   ├── shared_entries/   # [similar structure]
│   │   ├── notifications/    # [similar structure]
│   │   ├── settings/         # [similar structure]
│   │   ├── support/          # [similar structure]
│   │   └── admin/            # [similar structure]
│   ├── shared/
│   │   ├── widgets/
│   │   │   ├── app_button.dart
│   │   │   ├── app_text_field.dart
│   │   │   ├── apple_avatar.dart
│   │   │   ├── apple_badge.dart
│   │   │   ├── apple_bottom_sheet.dart
│   │   │   ├── apple_dialog.dart
│   │   │   ├── apple_list_tile.dart
│   │   │   ├── apple_pill_tab_bar.dart
│   │   │   ├── apple_navigation_bar.dart
│   │   │   ├── apple_toggle.dart
│   │   │   ├── apple_segmented_control.dart
│   │   │   ├── offline_banner.dart
│   │   │   └── loading_indicator.dart
│   │   └── providers/
│   │       └── global_providers.dart
│   └── l10n/                        # Localization (future)
├── assets/
│   ├── fonts/                       # SF Pro fonts
│   └── icons/                       # SVG icons
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/
├── ios/
│   ├── Runner/
│   │   ├── Info.plist
│   │   └── ...
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
├── pubspec.yaml
└── flutter_launcher_icons.yaml
```

---

## 5. Shared Packages (`packages/`)

```
packages/
├── shared-types/               # TypeScript interface definitions
│   ├── src/
│   │   ├── user.types.ts
│   │   ├── person.types.ts
│   │   ├── transaction.types.ts
│   │   ├── notification.types.ts
│   │   └── index.ts
│   └── package.json
└── shared-utils/               # Shared utility functions (TS)
    ├── src/
    │   ├── formatters.ts
    │   ├── validators.ts
    │   └── index.ts
    └── package.json
```

---

## 6. Documentation (`docs/`)

```
docs/
├── 01_Software_Requirements_Specification.md
├── 02_User_Manual.md
├── 03_Apple_Design_System.md
├── 04_Database_Design.md
├── 05_ER_Diagram.md
├── 06_API_Documentation.md
├── 07_Folder_Structure.md              ← This file
├── 08_Security_Documentation.md
├── 09_Notification_System.md
├── 10_Update_System.md
├── 11_Support_Chat_Documentation.md
├── 12_Admin_Panel_Documentation.md
├── 13_Backup_and_Disaster_Recovery.md
├── 14_Analytics_Dashboard_Documentation.md
├── 15_Family_Groups_Documentation.md
├── 16_Development_Rules.md
├── 17_Testing_Checklist.md
├── 18_Deployment_Guide.md
├── 19_Master_Development_Roadmap.md
├── 20_Coding_Standards.md
├── 21_Git_Branch_Strategy.md
├── 22_UI_Component_Library.md
├── 23_Design_Tokens.md
├── 24_Animation_Specification.md
├── 25_State_Management_Specification.md
├── 26_Error_Handling_Guide.md
├── 27_Logging_Guide.md
├── 28_Database_Migration_Guide.md
├── 29_Versioning_Guide.md
└── 30_Future_Expansion_Plan.md
```

---

*Credit Book Folder Structure — v1.0.0*
