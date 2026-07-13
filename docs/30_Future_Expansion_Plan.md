# Credit Book — Future Expansion Plan
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## Phase 2 Features (Next 6 Months)

| Feature | Priority | Effort | Notes |
|---------|---------|--------|-------|
| Group Ledgers | High | Medium | Share person ledgers across family groups |
| Expense Splitting | High | High | Split a bill among multiple people |
| Recurring Transactions | Medium | Medium | Auto-create transactions on schedule |
| Transaction Attachments | Medium | Medium | Attach photos (receipts) to transactions |
| Multi-currency | Low | High | Support USD, EUR, etc. |
| WhatsApp Reminders | Medium | Low | Send WhatsApp message as payment reminder |
| SMS Reminders | Low | Low | SMS reminder to contact |
| Biometric for Web | Low | Low | WebAuthn/FIDO2 biometric for browser |

---

## Phase 3 Features (6-12 Months)

| Feature | Priority | Effort | Notes |
|---------|---------|--------|-------|
| EMI Calculator | Medium | Low | Calculate monthly EMI for a loan |
| Budget Tracker | Medium | High | Set monthly budgets per category |
| Category Tags | Medium | Medium | Tag transactions (food, travel, etc.) |
| Bulk Import | Low | Medium | Import transactions from Excel |
| Voice Entry | Low | High | Record transaction by voice |
| Widget (Android) | Low | Medium | Home screen widget showing balances |
| Apple Watch | Low | High | Quick balance check on Apple Watch |
| Siri Shortcuts | Low | Medium | "Hey Siri, what does Ravi owe me?" |

---

## Technical Improvements

| Improvement | Priority | When |
|-------------|---------|------|
| Read Replica (DB) | High | When free tier bottlenecks |
| Redis Caching | Medium | Phase 14 (Optimization) |
| Row-Level Security (PostgreSQL) | High | Phase 8+ |
| End-to-End Encryption | Medium | Phase 2 |
| Biometric Web (WebAuthn) | Low | Phase 3 |
| Progressive Web App (PWA) | Medium | Phase 15 |
| macOS App | Low | Phase 3+ |
| Windows App | Low | Long term |

---

## Scaling Considerations

Currently designed for 2-20 family users. If ever expanded:

| Scale | Changes Required |
|-------|----------------|
| 20-100 users | Redis caching for persons/balance queries |
| 100-1000 users | Upgrade to Render paid tier, add read replica |
| 1000+ users | Database sharding, CDN for assets, microservices |

**Note:** The current architecture handles up to ~100 concurrent users without changes, far beyond family-scale needs.

---

## Platform Expansion

| Platform | Feasibility | Timeline |
|----------|------------|---------|
| macOS App | High (Flutter supports) | Phase 3 |
| Windows App | High (Flutter supports) | Phase 3 |
| Web PWA (installable) | Already partially supported | Phase 15 |
| Apple Watch | Medium (requires Swift) | Phase 4 |
| Tablet Optimized UI | Easy (responsive already) | Phase 2 |

---

## Monetization (Future, If Made Public)

Currently private/family-only. If ever considered for public release:
- Freemium: Free for 1 user, family plan for paid
- One-time purchase for iOS/Android
- Self-hosted option for privacy-conscious users

**Note:** This is purely hypothetical. Current plan is private family use only.

---

*Credit Book Future Expansion Plan — v1.0.0*
