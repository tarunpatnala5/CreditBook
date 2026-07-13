# Credit Book — Database Design
**Version:** 1.0.0  
**Date:** 2026-07-13  
**Database:** PostgreSQL 15+  
**ORM:** Prisma

---

## 1. Design Principles

1. **Soft Delete Everywhere** — No hard deletes. Every table has `deleted_at` timestamp
2. **Audit Trail** — All critical tables have audit log entries
3. **UUID Primary Keys** — For security and scalability; no sequential integer IDs exposed
4. **Timestamps** — Every table has `created_at`, `updated_at`, `deleted_at`
5. **Row-level Security** — Users can only query their own data
6. **Versioning** — Schema migrations tracked via Prisma Migrations
7. **Encryption** — Sensitive fields encrypted at application level before storage

---

## 2. Schema Overview

### Tables

| Table | Purpose |
|-------|---------|
| `users` | All registered users |
| `sessions` | JWT refresh token sessions |
| `persons` | Contacts/parties in a user's ledger |
| `transactions` | Individual financial entries |
| `interest_history` | Daily interest calculation log |
| `family_groups` | Named family groups |
| `family_group_members` | Users in family groups |
| `notifications` | All notifications per user |
| `notification_templates` | Reusable notification content |
| `support_messages` | Support chat messages |
| `app_versions` | Released app versions |
| `audit_logs` | Complete audit trail |
| `activity_logs` | User activity for analytics |
| `backups` | Backup metadata |
| `system_settings` | Admin-configurable global settings |
| `recycle_bin` | Soft-deleted records metadata |
| `pin_configs` | Per-user PIN settings |
| `push_tokens` | FCM device tokens |
| `announcements` | Admin broadcast messages |

---

## 3. Table Definitions

### 3.1 users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'user',
  status          user_status NOT NULL DEFAULT 'pending',
  avatar_url      TEXT,
  avatar_color    VARCHAR(7),               -- Hex color for initials avatar
  last_active_at  TIMESTAMPTZ,
  activated_at    TIMESTAMPTZ,
  activated_by    UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'deleted');

-- Indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

### 3.2 sessions

```sql
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(500) NOT NULL UNIQUE,
  device_info     JSONB,                   -- Browser/device info
  ip_address      INET,
  expires_at      TIMESTAMPTZ NOT NULL,
  last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
```

### 3.3 persons

```sql
CREATE TABLE persons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  linked_user_id  UUID REFERENCES users(id),  -- Auto-linked when phone matches a user
  avatar_color    VARCHAR(7),
  notes           TEXT,
  balance         DECIMAL(15, 2) NOT NULL DEFAULT 0.00,  -- Cached balance (positive = they owe, negative = you owe)
  last_activity_at TIMESTAMPTZ,
  delete_scheduled_at TIMESTAMPTZ,           -- 24-hour delete timer
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_persons_owner_id ON persons(owner_id);
CREATE INDEX idx_persons_phone ON persons(phone);
CREATE INDEX idx_persons_linked_user ON persons(linked_user_id);
CREATE INDEX idx_persons_deleted_at ON persons(deleted_at) WHERE deleted_at IS NULL;
```

### 3.4 transactions

```sql
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id       UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            transaction_type NOT NULL,    -- 'gave' or 'got'
  amount          DECIMAL(15, 2) NOT NULL,      -- Original amount
  current_amount  DECIMAL(15, 2) NOT NULL,      -- Current amount with interest
  description     TEXT,
  interest_rate   DECIMAL(5, 4),               -- e.g., 0.0200 = 2%
  interest_type   interest_type DEFAULT 'simple',
  balance_after   DECIMAL(15, 2),              -- Running balance snapshot
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          transaction_status NOT NULL DEFAULT 'current',
  last_interest_calc_at TIMESTAMPTZ,
  version         INTEGER NOT NULL DEFAULT 1,   -- For optimistic locking
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TYPE transaction_type AS ENUM ('gave', 'got');
CREATE TYPE transaction_status AS ENUM ('upcoming', 'current', 'completed');
CREATE TYPE interest_type AS ENUM ('simple', 'compound');

-- Indexes
CREATE INDEX idx_transactions_person_id ON transactions(person_id);
CREATE INDEX idx_transactions_owner_id ON transactions(owner_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_interest ON transactions(interest_rate) WHERE interest_rate IS NOT NULL;
```

### 3.5 interest_history

```sql
CREATE TABLE interest_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  principal       DECIMAL(15, 2) NOT NULL,
  rate            DECIMAL(5, 4) NOT NULL,
  interest_added  DECIMAL(15, 2) NOT NULL,
  running_total   DECIMAL(15, 2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interest_history_transaction ON interest_history(transaction_id);
CREATE INDEX idx_interest_history_date ON interest_history(date);
CREATE UNIQUE INDEX idx_interest_history_txn_date ON interest_history(transaction_id, date);
```

### 3.6 family_groups

```sql
CREATE TABLE family_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

### 3.7 family_group_members

```sql
CREATE TABLE family_group_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            group_member_role NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TYPE group_member_role AS ENUM ('owner', 'admin', 'member');
```

### 3.8 notifications

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  category        notification_category NOT NULL,
  deep_link       VARCHAR(500),              -- e.g., /persons/uuid, /transactions/uuid
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  action_data     JSONB,                     -- Extra data for actions
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TYPE notification_category AS ENUM (
  'transaction', 'support', 'update', 'activation', 'announcement', 'system'
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_category ON notifications(category);
```

### 3.9 push_tokens

```sql
CREATE TABLE push_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  platform        push_platform NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE TYPE push_platform AS ENUM ('fcm_android', 'fcm_ios', 'web_push');
```

### 3.10 support_messages

```sql
CREATE TABLE support_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),  -- user or admin
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  attachments     JSONB,                     -- File URLs if any
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX idx_support_messages_sender_id ON support_messages(sender_id);
CREATE INDEX idx_support_messages_is_read ON support_messages(is_read) WHERE is_read = FALSE;
```

### 3.11 app_versions

```sql
CREATE TABLE app_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version         VARCHAR(20) NOT NULL UNIQUE,   -- e.g., "1.2.3"
  platform        app_platform NOT NULL,
  release_notes   TEXT NOT NULL,
  download_url    TEXT,                          -- APK URL or TestFlight link
  file_size_bytes BIGINT,
  is_forced       BOOLEAN NOT NULL DEFAULT FALSE, -- Force update?
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES users(id)
);

CREATE TYPE app_platform AS ENUM ('android', 'ios', 'web');
```

### 3.12 audit_logs

```sql
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES users(id),
  actor_name      VARCHAR(255),              -- Denormalized for deleted users
  action          VARCHAR(100) NOT NULL,     -- e.g., 'transaction.created', 'user.deleted'
  resource_type   VARCHAR(50) NOT NULL,      -- e.g., 'transaction', 'person', 'user'
  resource_id     UUID,
  before_data     JSONB,                     -- State before change
  after_data      JSONB,                     -- State after change
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3.13 system_settings

```sql
CREATE TABLE system_settings (
  key             VARCHAR(100) PRIMARY KEY,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID REFERENCES users(id)
);

-- Default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('interest_type', '"simple"', 'Default interest calculation type'),
  ('interest_calc_hour', '0', 'Hour to run interest calculation (0 = midnight)'),
  ('upcoming_check_hour', '0', 'Hour to move upcoming transactions to current'),
  ('delete_grace_period_hours', '24', 'Hours before soft-deleted person is finalized'),
  ('backup_enabled', 'true', 'Enable automatic daily backups'),
  ('backup_retention_days', '30', 'Number of days to retain backups'),
  ('max_users', '20', 'Maximum number of family users'),
  ('app_name', '"Credit Book"', 'Application name'),
  ('support_chat_enabled', 'true', 'Enable support chat feature');
```

### 3.14 pin_configs

```sql
CREATE TABLE pin_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  pin_hash        VARCHAR(255) NOT NULL,
  biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.15 announcements

```sql
CREATE TABLE announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  target_user_ids UUID[],                    -- NULL = all users
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);
```

---

## 4. Relationships Summary

```
users
  ├── sessions (1:many)
  ├── pin_configs (1:1)
  ├── push_tokens (1:many)
  ├── persons [as owner] (1:many)
  │     ├── transactions (1:many)
  │     │     └── interest_history (1:many)
  │     └── [linked_user_id → users]
  ├── notifications (1:many)
  ├── support_messages [as sender] (1:many)
  ├── family_group_members (1:many)
  │     └── family_groups (many:many)
  └── audit_logs [as actor] (1:many)
```

---

## 5. Computed Fields and Caching

### Balance Caching Strategy

The `persons.balance` field is a **cached computed value**:
- Recomputed after every transaction INSERT/UPDATE/DELETE
- Recomputed daily after interest calculation
- Represents: SUM of (got transactions) - SUM of (gave transactions) with current_amount

```sql
-- Trigger to update cached balance
CREATE OR REPLACE FUNCTION update_person_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE persons
  SET balance = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN type = 'got' THEN current_amount 
        ELSE -current_amount 
      END
    ), 0)
    FROM transactions
    WHERE person_id = COALESCE(NEW.person_id, OLD.person_id)
      AND deleted_at IS NULL
      AND status = 'current'
  ),
  last_activity_at = NOW(),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.person_id, OLD.person_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_person_balance();
```

---

## 6. Background Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `interest_calc` | Daily at 00:00 | Calculate and apply interest to all active transactions |
| `upcoming_move` | Daily at 00:01 | Move scheduled transactions from upcoming to current |
| `person_delete` | Every 30 min | Check and finalize soft-deleted persons past grace period |
| `backup` | Daily at 02:00 | Export database and upload to Backblaze B2 |
| `cleanup_sessions` | Daily at 03:00 | Remove expired sessions |
| `cleanup_notifications` | Weekly | Remove read notifications older than 90 days |

---

## 7. Database Security

1. **Connection Pooling:** PgBouncer (or Prisma's built-in pool)
2. **SSL:** Force SSL connections only (`sslmode=require`)
3. **Roles:** Application uses a limited-privilege DB user; no SUPERUSER
4. **Schema:** All tables in `creditbook` schema; app user has USAGE on schema only
5. **Row-level Security (future):** PostgreSQL RLS policies for multi-tenant isolation

---

## 8. Backup Strategy

1. **Render Automatic Backups:** Daily snapshots (paid feature on Render — free tier has none)
2. **Application-level Backup:** Node.js cron job runs `pg_dump` nightly → uploads to Backblaze B2 free tier
3. **Real-time Replication (future):** Consider read replica on Render when available
4. **Backup Retention:** 30 days of daily backups, 12 months of monthly archives

---

*Credit Book Database Design — v1.0.0*
