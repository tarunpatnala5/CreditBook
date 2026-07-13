# Credit Book — Security Documentation
**Version:** 1.0.0  
**Date:** 2026-07-13  
**Compliance:** OWASP Top 10

---

## 1. Security Philosophy

Credit Book is a private family application handling real financial data. While it is not published publicly, security is non-negotiable. The system is designed with **defense in depth** — multiple layers of security ensure data safety even if one layer is compromised.

---

## 2. Authentication Security

### 2.1 Password Hashing

```javascript
// bcrypt with 12 salt rounds
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

**Why 12 rounds?** At 12 rounds, each password hash takes ~250ms. This makes brute force attacks impractical while remaining fast enough for user login.

### 2.2 JWT Token Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Access Token   │         │  Refresh Token    │
│  (15 min TTL)   │         │  (30 day TTL)     │
│  In memory/     │         │  HttpOnly cookie  │
│  localStorage   │         │  or SecureStorage │
└─────────────────┘         └──────────────────┘
```

**Access Token Payload:**
```json
{
  "sub": "user-uuid",
  "role": "user",
  "iat": 1720854000,
  "exp": 1720854900
}
```

**Refresh Token Rotation:**
- Every refresh issues a new refresh token and invalidates the old one
- Compromised refresh tokens detected by checking if an old token is used after rotation
- All sessions force-invalidated on password change

### 2.3 Session Management

```javascript
// Detect refresh token reuse (token rotation attack detection)
async function refreshTokens(oldRefreshToken) {
  const session = await db.sessions.findUnique({
    where: { refreshToken: oldRefreshToken }
  });
  
  if (!session) {
    // Token already used or doesn't exist — possible attack
    await db.sessions.deleteMany({ where: { userId: session?.userId } });
    throw new UnauthorizedError('Session compromised. All sessions revoked.');
  }
  
  if (session.revokedAt) {
    throw new UnauthorizedError('Token already revoked.');
  }
  
  if (new Date() > session.expiresAt) {
    throw new UnauthorizedError('Session expired.');
  }
  
  // Issue new tokens, revoke old session
  // ...
}
```

### 2.4 Rate Limiting

```javascript
// Auth endpoints — stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 attempts
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

// PIN failure lockout
const PIN_MAX_ATTEMPTS = 5;
const PIN_LOCKOUT_MINUTES = 10;
```

---

## 3. Data Security

### 3.1 Transport Security (HTTPS)

- All communication is HTTPS-only
- HSTS headers enforced
- TLS 1.2 minimum (TLS 1.3 preferred)
- No mixed content allowed

### 3.2 Database Security

```javascript
// Never store plain text credentials
// Environment variable validation on startup
const env = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15),
}).parse(process.env);
```

### 3.3 Sensitive Data Handling

**What is encrypted at application level (before DB storage):**
- Phone numbers (optional — adds query complexity, apply if needed)
- Support chat messages content

**What is hashed (irreversible):**
- Passwords (bcrypt)
- PIN numbers (bcrypt)

**What is stored plain (but access-controlled):**
- Names
- Amounts
- Descriptions

### 3.4 SQL Injection Prevention

- **Prisma ORM** used exclusively — parameterized queries by design
- No raw SQL strings with user input
- All raw queries use Prisma's `$queryRaw` with tagged template literals

```javascript
// NEVER do this:
const result = await db.$queryRaw(`SELECT * FROM users WHERE phone = '${phone}'`);

// ALWAYS use parameterized:
const result = await db.$queryRaw`SELECT * FROM users WHERE phone = ${phone}`;
// Or better, use Prisma's typed queries:
const user = await db.users.findUnique({ where: { phone } });
```

---

## 4. Authorization

### 4.1 Role-Based Access Control (RBAC)

| Permission | User | Admin |
|-----------|------|-------|
| View own data | ✓ | ✓ |
| Create persons | ✓ | ✓ |
| Create transactions | ✓ | ✓ |
| View shared entries | ✓ | ✓ |
| View all users | ✗ | ✓ |
| Activate users | ✗ | ✓ |
| Delete any user | ✗ | ✓ |
| View all support chats | ✗ | ✓ |
| Reply to support | ✗ | ✓ |
| Publish app versions | ✗ | ✓ |
| View analytics | ✗ | ✓ |
| View audit logs | ✗ | ✓ |
| Access recycle bin | ✗ | ✓ |
| Send announcements | ✗ | ✓ |
| Manage backups | ✗ | ✓ |

### 4.2 Data Isolation

All queries automatically filter by `owner_id` to prevent cross-user data access:

```javascript
// Middleware that adds user context to all queries
async function getPersons(userId, filters) {
  return db.persons.findMany({
    where: {
      ownerId: userId,        // ALWAYS filter by owner
      deletedAt: null,
      ...filters
    }
  });
}
```

### 4.3 Ownership Validation

Before any mutation, verify the resource belongs to the requester:

```javascript
async function validatePersonOwnership(personId, userId) {
  const person = await db.persons.findFirst({
    where: { id: personId, ownerId: userId, deletedAt: null }
  });
  if (!person) throw new ForbiddenError('You do not have access to this resource.');
  return person;
}
```

---

## 5. Input Validation

### 5.1 Server-Side Validation (Zod)

```javascript
// All request bodies validated with Zod schemas
const createTransactionSchema = z.object({
  type: z.enum(['gave', 'got']),
  amount: z.number().positive().max(99999999.99),
  description: z.string().max(500).optional(),
  transactionDate: z.string().datetime(),
  interestRate: z.number().min(0).max(100).optional(),
  interestType: z.enum(['simple', 'compound']).optional()
});
```

### 5.2 Client-Side Validation

- Form fields validated before submission
- Phone number format validated with libphonenumber
- Amount validated as positive number with max 2 decimal places
- Description sanitized (HTML stripped)

### 5.3 XSS Prevention

```javascript
// Sanitize all text output in React components
import DOMPurify from 'dompurify';

function sanitize(html) {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}

// Use in JSX: {sanitize(user.description)}
```

---

## 6. Security Headers

```javascript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // inline needed for React
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "wss://creditbook-api.onrender.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false // Allow Cloudinary images
}));
```

---

## 7. Audit Logging

### 7.1 What is Logged

| Action | Logged? |
|--------|---------|
| User login | ✓ |
| User logout | ✓ |
| Login failure | ✓ |
| User created | ✓ |
| User activated/rejected | ✓ |
| User deleted | ✓ |
| Person created/edited/deleted | ✓ |
| Transaction created/edited/deleted | ✓ |
| Report generated | ✓ |
| Admin panel access | ✓ |
| Password change | ✓ |
| PIN change | ✓ |
| Settings change | ✓ |
| Database backup | ✓ |
| App version published | ✓ |

### 7.2 Audit Log Entry

```javascript
async function writeAuditLog({
  actorId,
  actorName,
  action,
  resourceType,
  resourceId,
  beforeData,
  afterData,
  req
}) {
  await db.auditLogs.create({
    data: {
      actorId,
      actorName,
      action,
      resourceType,
      resourceId,
      beforeData: beforeData ? JSON.stringify(beforeData) : null,
      afterData: afterData ? JSON.stringify(afterData) : null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });
}
```

---

## 8. Secrets Management

### 8.1 Environment Variables

```env
# .env (never commit to git)

# Database
DATABASE_URL=postgresql://user:password@host:5432/creditbook
REDIS_URL=redis://...

# JWT
JWT_ACCESS_SECRET=<64-char random string>
JWT_REFRESH_SECRET=<64-char random string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Firebase
FIREBASE_PROJECT_ID=creditbook-family
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Backblaze B2
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=

# Admin
ADMIN_PHONE=+919xxxxxxxxx
```

### 8.2 Secret Rotation

- JWT secrets rotated every 6 months (all sessions invalidated, re-login required)
- Database password rotated annually
- Firebase credentials managed via Google Cloud Console

---

## 9. Mobile App Security

### 9.1 Android

- APK signing with release keystore (store keystore file securely, offline)
- ProGuard/R8 code obfuscation enabled for release builds
- Certificate pinning for API calls (consider adding if security is critical)
- `flutter_secure_storage` used for tokens (uses Android Keystore)
- No sensitive data in shared preferences or logs in release builds

### 9.2 iOS

- Keychain used for sensitive storage (via `flutter_secure_storage`)
- App Transport Security (ATS) enforced — HTTPS only
- Biometric authentication via LocalAuthentication

### 9.3 Biometric Authentication

```dart
// Flutter biometric authentication
import 'package:local_auth/local_auth.dart';

final LocalAuthentication auth = LocalAuthentication();

Future<bool> authenticateWithBiometric() async {
  final bool canAuthenticate = await auth.canCheckBiometrics;
  if (!canAuthenticate) return false;
  
  return await auth.authenticate(
    localizedReason: 'Authenticate to open Credit Book',
    options: const AuthenticationOptions(
      biometricOnly: false,  // Allow PIN as fallback
      useErrorDialogs: true,
    ),
  );
}
```

---

## 10. Incident Response

### 10.1 Security Incident Types

| Severity | Example | Response |
|---------|---------|---------|
| Critical | Database breach | Immediate: change all secrets, rotate tokens, notify users |
| High | Unauthorized admin access | Revoke sessions, audit logs review, change credentials |
| Medium | Brute force detected | Automatic lockout active, review logs |
| Low | Invalid token attempts | Logged, monitored |

### 10.2 Response Steps

1. **Detect:** Automated monitoring via error rate spikes, audit log anomalies
2. **Contain:** Revoke affected sessions / rotate secrets
3. **Assess:** Review audit logs to understand scope
4. **Remediate:** Fix vulnerability, deploy patch
5. **Review:** Update security measures

---

*Credit Book Security Documentation — v1.0.0*
