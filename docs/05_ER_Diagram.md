# Credit Book — ER Diagram (Entity Relationship)
**Version:** 1.0.0  
**Date:** 2026-07-13

---

## 1. Entity Relationship Diagram

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          CREDIT BOOK — ER DIAGRAM                              │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌──────────────────────┐
│      USERS      │         │     SESSIONS      │         │     PIN_CONFIGS      │
├─────────────────┤         ├──────────────────┤         ├──────────────────────┤
│ PK id (UUID)    │──┐   ┌──│ PK id (UUID)     │         │ PK id (UUID)         │
│    name         │  │   │  │ FK user_id        │         │ FK user_id           │──┐
│    phone (UNIQ) │  │   │  │    refresh_token  │         │    pin_hash          │  │
│    password_hash│  │   │  │    device_info    │         │    biometric_enabled │  │
│    role         │  │   │  │    ip_address     │         │    failed_attempts   │  │
│    status       │  │   │  │    expires_at     │         │    locked_until      │  │
│    avatar_url   │  │   │  │    revoked_at     │         └──────────────────────┘  │
│    avatar_color │  │   │  └──────────────────┘                                   │
│    last_active  │  │   │                                                          │
│    activated_at │  │   └──────────────────────────────────────────────────────────┘
│    activated_by │  │                                                          │
│    created_at   │  │   ┌──────────────────┐                                   │
│    updated_at   │  └───│   PUSH_TOKENS    │                                   │
│    deleted_at   │      ├──────────────────┤                                   │
└────────┬────────┘      │ PK id (UUID)     │                                   │
         │               │ FK user_id       │◄──────────────────────────────────┘
         │               │ FK session_id    │
         │               │    token (TEXT)  │
         │               │    platform      │
         │               └──────────────────┘
         │
         │  ┌─────────────────────────────────────────────────────────────────┐
         │  │                        PERSONS                                  │
         ├──┤ PK id (UUID)                                                    │
         │  │ FK owner_id → users.id                                          │
         │  │ FK linked_user_id → users.id (nullable)                         │
         │  │    name                                                          │
         │  │    phone                                                         │
         │  │    avatar_color                                                  │
         │  │    balance (DECIMAL, cached)                                     │
         │  │    last_activity_at                                              │
         │  │    delete_scheduled_at                                           │
         │  │    created_at / updated_at / deleted_at                         │
         │  └──────────────────────┬──────────────────────────────────────────┘
         │                         │
         │                         │ 1:many
         │              ┌──────────▼────────────┐
         │              │      TRANSACTIONS      │
         │              ├───────────────────────┤
         │              │ PK id (UUID)           │
         │              │ FK person_id           │
         │              │ FK owner_id → users    │
         │              │    type (gave/got)     │
         │              │    amount (DECIMAL)    │
         │              │    current_amount      │
         │              │    description         │
         │              │    interest_rate       │
         │              │    interest_type       │
         │              │    balance_after       │
         │              │    transaction_date    │
         │              │    status              │
         │              │    last_interest_calc  │
         │              │    version (INT)        │
         │              │    created_at           │
         │              │    updated_at           │
         │              │    deleted_at           │
         │              └──────────┬─────────────┘
         │                         │
         │                         │ 1:many
         │              ┌──────────▼───────────────┐
         │              │     INTEREST_HISTORY      │
         │              ├──────────────────────────┤
         │              │ PK id (UUID)              │
         │              │ FK transaction_id         │
         │              │    date (DATE, UNIQ w/txn)│
         │              │    principal              │
         │              │    rate                   │
         │              │    interest_added         │
         │              │    running_total          │
         │              │    created_at             │
         │              └──────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────┐
         │  │                    NOTIFICATIONS                             │
         ├──┤ PK id (UUID)                                                 │
         │  │ FK user_id → users.id                                        │
         │  │    title                                                      │
         │  │    body                                                       │
         │  │    category (enum)                                            │
         │  │    deep_link                                                  │
         │  │    is_read (BOOL)                                            │
         │  │    read_at                                                    │
         │  │    action_data (JSONB)                                        │
         │  │    created_at / deleted_at                                   │
         │  └──────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────┐
         │  │                  SUPPORT_MESSAGES                            │
         ├──┤ PK id (UUID)                                                 │
         │  │ FK user_id → users.id (conversation owner)                   │
         │  │ FK sender_id → users.id (who sent this message)              │
         │  │    message (TEXT)                                             │
         │  │    is_read (BOOL)                                            │
         │  │    read_at                                                    │
         │  │    attachments (JSONB)                                        │
         │  │    created_at / deleted_at                                   │
         │  └──────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────┐
         │  │                    AUDIT_LOGS                                │
         ├──┤ PK id (UUID)                                                 │
         │  │ FK actor_id → users.id (nullable)                            │
         │  │    actor_name (denormalized)                                  │
         │  │    action (VARCHAR)                                           │
         │  │    resource_type (VARCHAR)                                   │
         │  │    resource_id (UUID)                                        │
         │  │    before_data (JSONB)                                       │
         │  │    after_data (JSONB)                                        │
         │  │    ip_address                                                │
         │  │    user_agent                                                │
         │  │    created_at                                                │
         │  └──────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────┐
         │  │                 FAMILY_GROUP_MEMBERS                         │
         │  ├──────────────────────────────────────────────────────────────┤
         ├──┤ FK user_id → users.id                                        │
            │ FK group_id → family_groups.id                               │
            │    role (enum)                                                │
            │    joined_at                                                  │
            └─────────────────────────────────┬────────────────────────────┘
                                              │
                              ┌───────────────▼───────────────┐
                              │        FAMILY_GROUPS          │
                              ├───────────────────────────────┤
                              │ PK id (UUID)                  │
                              │ FK created_by → users.id      │
                              │    name                       │
                              │    description                │
                              │    created_at / deleted_at    │
                              └───────────────────────────────┘
```

---

## 2. Key Relationships Table

| Parent Entity | Child Entity | Relationship | FK Column | On Delete |
|--------------|-------------|-------------|-----------|-----------|
| users | sessions | 1:many | sessions.user_id | CASCADE |
| users | pin_configs | 1:1 | pin_configs.user_id | CASCADE |
| users | push_tokens | 1:many | push_tokens.user_id | CASCADE |
| users | persons (as owner) | 1:many | persons.owner_id | CASCADE |
| users | persons (as linked) | 1:many | persons.linked_user_id | SET NULL |
| users | notifications | 1:many | notifications.user_id | CASCADE |
| users | support_messages | 1:many | support_messages.user_id | CASCADE |
| persons | transactions | 1:many | transactions.person_id | CASCADE |
| transactions | interest_history | 1:many | interest_history.transaction_id | CASCADE |
| users | family_group_members | 1:many | family_group_members.user_id | CASCADE |
| family_groups | family_group_members | 1:many | family_group_members.group_id | CASCADE |

---

## 3. Cardinality Details

### Users ↔ Persons
- **One user** can have **many persons** (their ledger contacts)
- A person can be **linked** to at most one user (via phone number matching)
- This creates the "Shared Entries" feature: Person A creates a ledger entry with Person B's phone → Person B sees it in their Shared Entries tab

### Persons ↔ Transactions
- **One person** can have **many transactions**
- Each transaction belongs to exactly one person
- Transactions are always from the ledger owner's perspective

### Transactions ↔ Interest History
- If a transaction has interest_rate, daily entries are created in interest_history
- Each date has exactly one entry per transaction (unique constraint)

### Users ↔ Family Groups (via Family Group Members)
- Many-to-many relationship
- A user can be in multiple groups
- A group can have multiple users

---

## 4. Index Strategy

### Primary Indexes (automatically created)
- All PK (UUID) columns

### Composite Indexes
```sql
-- Most common query: user's persons list
CREATE INDEX idx_persons_owner_active ON persons(owner_id, last_activity_at DESC) 
  WHERE deleted_at IS NULL;

-- Person's transactions sorted by date
CREATE INDEX idx_transactions_person_date ON transactions(person_id, transaction_date DESC) 
  WHERE deleted_at IS NULL;

-- User's unread notifications count
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) 
  WHERE is_read = FALSE AND deleted_at IS NULL;

-- Support messages per conversation
CREATE INDEX idx_support_user_created ON support_messages(user_id, created_at ASC) 
  WHERE deleted_at IS NULL;
```

---

## 5. Data Flow Examples

### Recording a Transaction

```
User taps "YOU GAVE ₹500" for person "Ravi"
  ↓
POST /api/transactions
  ↓
INSERT into transactions (person_id, type='gave', amount=500, current_amount=500, ...)
  ↓
TRIGGER: update_person_balance() fires
  ↓
UPDATE persons SET balance = balance - 500, last_activity_at = NOW()
  ↓
WebSocket: emit 'balance_updated' to all connected sessions of owner
  ↓
If linked_user_id exists: emit 'shared_entry_updated' to linked user's sessions
  ↓
INSERT into notifications (user_id=linked_user_id, category='transaction', ...)
  ↓
FCM push notification sent to linked user's devices
```

### Daily Interest Calculation (Cron Job)

```
Cron triggers at 00:00
  ↓
SELECT all transactions WHERE interest_rate IS NOT NULL AND status = 'current' AND deleted_at IS NULL
  ↓
For each transaction:
  interest_added = (current_amount × interest_rate) / 365
  new_current_amount = current_amount + interest_added
  ↓
INSERT into interest_history (transaction_id, date=TODAY, principal, rate, interest_added, running_total)
  ↓
UPDATE transactions SET current_amount = new_current_amount, last_interest_calc_at = NOW()
  ↓
TRIGGER: update_person_balance() fires for each affected person
  ↓
Log job completion in audit_logs
```

---

*Credit Book ER Diagram — v1.0.0*
