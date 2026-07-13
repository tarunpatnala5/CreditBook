# Credit Book — Development Rules
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Fundamental Rules

These rules are non-negotiable. Every commit must comply.

### 1.1 Code Quality Rules

1. **Never duplicate code** — Extract into reusable components, services, or utilities
2. **Never hardcode colors** — Always use design tokens (CSS variables or Dart constants)
3. **Never hardcode spacing** — Always use spacing constants
4. **Never hardcode strings** — Use constants for routes, query keys, event names
5. **Always handle errors** — No unhandled promises, no silent failures
6. **Always validate inputs** — Server-side validation is mandatory; client-side is a bonus
7. **Always use TypeScript** — No plain JavaScript files in web or API (unless config files)
8. **Always use async/await** — No raw .then()/.catch() chains
9. **Comment important logic** — Complex business logic must have comments
10. **One component per file** — No multiple exports from a single component file

### 1.2 Architecture Rules

1. **Separation of concerns** — UI, business logic, and data fetching are separate
2. **Feature-first structure** — Code organized by feature, not by type
3. **No business logic in components** — Move to hooks, services, or stores
4. **No direct database calls in routes** — Controller → Service → Database
5. **No raw SQL** — Use Prisma ORM exclusively
6. **Services are stateless** — All state lives in the database or state stores
7. **APIs are versioned** — All endpoints under `/api/v1/`

### 1.3 Security Rules

1. **Never commit secrets** — No `.env` files, API keys, or passwords in git
2. **Always sanitize user input** — Strip HTML, validate types and ranges
3. **Always use parameterized queries** — Never string-concatenate SQL
4. **Always verify ownership** — Check that the user owns the resource before mutation
5. **Always check role** — Admin endpoints must verify admin role
6. **Never log sensitive data** — No passwords, tokens, or personal data in logs
7. **Always use HTTPS** — No HTTP links in production

---

## 2. Design Rules

1. **Apple design language only** — No Material Design components
2. **Minimum touch target: 44×44pt** — All interactive elements
3. **Always support dark mode** — No hardcoded colors that don't have dark equivalents
4. **Always handle loading states** — Show skeletons or spinners while fetching
5. **Always handle empty states** — Show helpful empty state UI, not blank pages
6. **Always handle error states** — Show user-friendly error messages, not raw errors
7. **Always animate transitions** — Use spring animations for all sheet presentations
8. **Safe areas respected** — Content never hidden behind notch, home indicator, or dynamic island
9. **Fonts: SF Pro only** — No system fonts in production UI
10. **Use semantic HTML** — Accessibility is built-in, not bolted on

---

## 3. State Management Rules

1. **Zustand stores** for global state (web)
2. **React Query** for server state (caching, fetching, mutations)
3. **Riverpod** for Flutter state management
4. **Local state (useState)** for UI-only state (modals, toggles)
5. **Never mutate state directly** — Always use setter functions
6. **Optimistic updates** for all mutations — Update UI immediately, rollback on error
7. **Cache invalidation** after mutations — Always invalidate related queries

---

## 4. Git Rules

*See `21_Git_Branch_Strategy.md` for full details.*

1. **Never commit to main directly** — Always use feature branches
2. **Commit messages follow Conventional Commits** format
3. **One feature per branch** — Small, focused PRs
4. **Always pull before pushing** — Avoid merge conflicts
5. **Tag releases** — Every published version tagged as `v1.0.0`

---

## 5. Testing Rules

1. **Unit test all service functions** — Business logic must be testable
2. **Integration test all API endpoints** — Every route has at least one test
3. **Widget tests for critical UI flows** — Auth, transaction creation, person creation
4. **No production deployment without passing tests**

---

## 6. Performance Rules

1. **Lazy load routes** — All pages lazy-loaded in React
2. **Paginate lists** — Never load all records without pagination
3. **Use indices** — All frequently filtered columns must be indexed
4. **Cache balance calculations** — `persons.balance` is a cached field, not computed on every request
5. **Debounce search** — 300ms debounce on search inputs
6. **Image optimization** — All images compressed and served in WebP format
7. **Minimize bundle** — Tree-shake unused code; keep main bundle < 200KB gzipped

---

## 7. Documentation Rules

1. **Update docs when behavior changes** — Code and docs must be in sync
2. **Add JSDoc comments to all service functions**
3. **Add inline comments for complex business logic**
4. **Keep README.md updated** — Setup, env vars, and deployment instructions

---

*Credit Book Development Rules — v1.0.0*
