# Credit Book — Versioning Guide
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Version Format

Credit Book follows **Semantic Versioning (SemVer):**

```
MAJOR.MINOR.PATCH
```

| Part | Increment When |
|------|---------------|
| MAJOR | Breaking change (DB schema incompatible, redesign) |
| MINOR | New feature added (backward compatible) |
| PATCH | Bug fix (backward compatible) |

**Examples:**
- `1.0.0` → Initial release
- `1.0.1` → Fixed interest calculation bug
- `1.1.0` → Added Family Groups feature
- `2.0.0` → Complete UI redesign, DB migration required

---

## 2. Build Numbers

### Android (`pubspec.yaml`)
```yaml
version: 1.2.3+10203
# version: MAJOR.MINOR.PATCH+BUILD_NUMBER
# Build number = MAJOR*10000 + MINOR*100 + PATCH
# 1.2.3 → build 10203
```

### iOS (`pubspec.yaml` — same file, Flutter handles both)
```yaml
version: 1.2.3+10203
```

### Web (`package.json`)
```json
{
  "version": "1.2.3"
}
```

### API (`package.json`)
```json
{
  "version": "1.2.3"
}
```

---

## 3. Changelog Format

Maintain a `CHANGELOG.md` in the root directory:

```markdown
# Changelog

## [1.2.0] - 2026-08-01

### Added
- Family Groups feature (admin can group users)
- Interest history view per transaction
- PDF reports now include interest breakdown

### Changed
- Balance card now shows real-time updates via WebSocket
- Settings page redesigned with new section grouping

### Fixed
- Balance calculation off-by-one error when interest applied
- Dark mode separator colors incorrect on iOS

### Security
- Refresh token rotation now properly invalidates reused tokens

---

## [1.0.1] - 2026-07-20

### Fixed
- Login rate limiter was too aggressive (now 10 attempts per 15 min)
- Notification badge count not clearing after mark-all-read

---

## [1.0.0] - 2026-07-13

### Added
- Initial release
- Full authentication system with admin activation
- Person ledger management
- Transaction recording (gave/got)
- Interest calculation (daily, simple interest)
- Upcoming transactions
- Shared Entries (view-only)
- Notifications system
- Support Chat
- In-app updates
- Dark mode
- Offline mode (Android + iOS)
- PDF/CSV/Excel reports
- Admin panel (users, activations, support, analytics)
```

---

## 4. API Versioning

All API endpoints are versioned:
```
/api/v1/auth/login
/api/v1/persons
/api/v2/persons  (future version with breaking changes)
```

When a breaking API change is needed:
1. Create new versioned routes (`/api/v2/`)
2. Maintain old routes for backward compatibility
3. Deprecate old routes with warning header
4. Remove old routes after all clients are updated (major version bump)

---

## 5. Release Checklist

Before tagging a release:

- [ ] All tests passing (`npm test`, `flutter test`)
- [ ] `CHANGELOG.md` updated
- [ ] Version bumped in all `package.json` and `pubspec.yaml`
- [ ] API migration applied to production database
- [ ] Web app deployed to Vercel
- [ ] Android APK built and uploaded to GitHub Releases/Backblaze
- [ ] iOS IPA submitted to TestFlight
- [ ] Admin creates app_version entry in database
- [ ] Admin publishes version (triggers push notifications)
- [ ] Git tag created: `git tag v1.2.0 && git push origin v1.2.0`

---

*Credit Book Versioning Guide — v1.0.0*
