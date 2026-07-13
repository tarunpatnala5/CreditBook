# Credit Book — Git Branch Strategy
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Branch Structure

```
main                    ← Production (always deployable)
  └── develop           ← Integration branch (daily work)
        ├── feature/    ← New features
        ├── fix/        ← Bug fixes
        ├── hotfix/     ← Critical production fixes
        └── chore/      ← Maintenance (deps, config, docs)
```

---

## 2. Branch Naming

```
feature/auth-login
feature/person-create
feature/transaction-interest
fix/balance-calculation-bug
fix/login-rate-limit
hotfix/critical-auth-bypass
chore/update-dependencies
chore/add-tests-auth
docs/update-api-docs
```

---

## 3. Commit Message Format (Conventional Commits)

```
type(scope): short description

[optional body]
[optional footer]
```

**Types:**
| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semi colons (no code change) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Build process, dependencies |
| `perf` | Performance improvements |

**Examples:**
```
feat(auth): implement JWT refresh token rotation

fix(transaction): correct balance calculation on interest update

Closes #12

docs(api): add missing pagination parameters to persons endpoint

chore(deps): update Prisma from 5.x to 6.x
```

---

## 4. Workflow

### 4.1 Feature Development

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/transaction-interest

# Work, commit frequently
git add .
git commit -m "feat(transaction): add interest rate field to transaction model"

# Push branch
git push origin feature/transaction-interest

# When done, merge back to develop
git checkout develop
git merge feature/transaction-interest
git push origin develop

# Delete feature branch
git branch -d feature/transaction-interest
git push origin --delete feature/transaction-interest
```

### 4.2 Release

```bash
# Merge develop into main for release
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

### 4.3 Hotfix (Critical Production Bug)

```bash
# Branch from main
git checkout main
git checkout -b hotfix/auth-token-exploit

# Fix, commit
git commit -m "fix(auth): prevent refresh token reuse attack"

# Merge to BOTH main and develop
git checkout main && git merge hotfix/auth-token-exploit
git checkout develop && git merge hotfix/auth-token-exploit

git tag v1.0.1
git push origin main develop --tags
```

---

## 5. Release Tags

```
v1.0.0  — Initial release
v1.0.1  — Patch (bug fix)
v1.1.0  — Minor (new feature)
v2.0.0  — Major (breaking change)
```

---

## 6. What to Include in .gitignore

```gitignore
# Dependencies
node_modules/
.flutter-plugins
.flutter-plugins-dependencies
.pub-cache/

# Environment
.env
.env.local
.env.production
apps/api/.env

# Build outputs
dist/
build/
apps/mobile/build/
apps/web/dist/

# Mobile signing
*.jks
*.keystore
key.properties
GoogleService-Info.plist
google-services.json

# IDE
.idea/
.vscode/settings.json
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Prisma
apps/api/src/prisma/migrations/**/migration_lock.toml
```

---

*Credit Book Git Branch Strategy — v1.0.0*
