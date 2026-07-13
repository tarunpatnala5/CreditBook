# Credit Book — Logging Guide
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Logging Strategy

### Levels
| Level | When to Use |
|-------|------------|
| `error` | Unhandled exceptions, critical failures |
| `warn` | Degraded state, retries, deprecated usage |
| `info` | Key business events (login, transaction, backup) |
| `debug` | Detailed diagnostic info (development only) |

---

## 2. Winston Logger Setup (API)

```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.colorize({ all: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level}]: ${message} ${stack || ''} ${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
```

---

## 3. What to Log

### ✅ DO Log

```typescript
// Business events (info)
logger.info('User logged in', { userId: user.id, ip: req.ip });
logger.info('Transaction created', { txnId: txn.id, personId, amount, type });
logger.info('User activated', { activatedUserId, adminId });
logger.info('Backup completed', { filename, sizeMB });
logger.info('Upcoming transaction moved to current', { txnId, personId });

// Warnings
logger.warn('Failed login attempt', { phone: req.body.phone, ip: req.ip, attempts });
logger.warn('Keep-alive ping failed', { url, error: err.message });
logger.warn('Token refresh attempted with old token', { userId });

// Errors
logger.error('Database connection failed', { error, stack: err.stack });
logger.error('Backup failed', { error: err.message, filename });
logger.error('Push notification failed', { userId, tokens, error });
```

### ❌ NEVER Log

```typescript
// NEVER log these
logger.info('Password: ' + password);            // Never log passwords
logger.info('Token: ' + accessToken);            // Never log tokens
logger.info('User data: ' + JSON.stringify(user)); // PII in logs
logger.debug('Phone: ' + phone);                  // Phone numbers are PII
```

---

## 4. Request Logging (Morgan)

```typescript
// middleware/requestLogger.ts
import morgan from 'morgan';

// Log format: method url status response-time userId
app.use(morgan(':method :url :status :response-time ms - :res[content-length] bytes', {
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    }
  },
  skip: (req) => req.url === '/health' // Don't log health checks
}));
```

---

## 5. Client-Side Logging (Web)

```typescript
// utils/logger.ts (web)
const logger = {
  error: (message: string, context?: unknown) => {
    if (import.meta.env.PROD) {
      // Send to error tracking service (optional: Sentry free tier)
      console.error(message, context);
    } else {
      console.error(message, context);
    }
  },
  warn: (message: string, context?: unknown) => {
    if (!import.meta.env.PROD) console.warn(message, context);
  },
  info: (message: string, context?: unknown) => {
    if (!import.meta.env.PROD) console.info(message, context);
  },
  debug: (message: string, context?: unknown) => {
    if (import.meta.env.DEV) console.debug(message, context);
  },
};

export default logger;
```

---

## 6. Log Retention

- **Error logs:** 30 days
- **Combined logs:** 7 days
- **Request logs:** 3 days
- Logs rotate daily via `winston-daily-rotate-file`

---

*Credit Book Logging Guide — v1.0.0*
