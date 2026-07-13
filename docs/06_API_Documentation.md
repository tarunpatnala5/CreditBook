# Credit Book — API Documentation
**Version:** 1.0.0  
**Base URL:** `https://creditbook-api.onrender.com/api/v1`  
**Format:** JSON  
**Auth:** JWT Bearer Token

---

## 1. Authentication

### 1.1 Register

```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "Ravi Kumar",
  "phone": "+919876543210",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created. Please contact admin for activation.",
  "data": {
    "id": "uuid",
    "name": "Ravi Kumar",
    "phone": "+919876543210",
    "status": "pending",
    "createdAt": "2026-07-13T09:00:00Z"
  }
}
```

**Errors:**
- `400` Phone already registered
- `400` Passwords don't match
- `400` Invalid phone format
- `400` Password too weak

---

### 1.2 Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "name": "Ravi Kumar",
      "phone": "+919876543210",
      "role": "user",
      "status": "active",
      "avatarColor": "#007AFF"
    }
  }
}
```

**Errors:**
- `401` Invalid credentials
- `403` Account not activated
- `403` Account suspended
- `429` Too many attempts (rate limited)

---

### 1.3 Refresh Token

```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### 1.4 Logout

```
POST /auth/logout
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Logout All Devices

```
POST /auth/logout-all
Authorization: Bearer {token}
```

---

## 2. Users

### 2.1 Get Current User

```
GET /users/me
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ravi Kumar",
    "phone": "+919876543210",
    "role": "user",
    "status": "active",
    "avatarUrl": null,
    "avatarColor": "#007AFF",
    "lastActiveAt": "2026-07-13T09:00:00Z"
  }
}
```

---

### 2.2 Update Profile

```
PATCH /users/me
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Ravi K",
  "phone": "+919876543211"
}
```

---

### 2.3 Delete Account

```
DELETE /users/me
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "confirmation": "DELETE"
}
```

---

### 2.4 [Admin] Get All Users

```
GET /users?status=active&page=1&limit=20
Authorization: Bearer {admin_token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 8,
    "page": 1,
    "totalPages": 1
  }
}
```

---

### 2.5 [Admin] Get Pending Users

```
GET /users/pending
Authorization: Bearer {admin_token}
```

---

### 2.6 [Admin] Activate User

```
POST /users/{userId}/activate
Authorization: Bearer {admin_token}
```

---

### 2.7 [Admin] Reject User

```
POST /users/{userId}/reject
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "reason": "Not a family member"
}
```

---

### 2.8 [Admin] Delete User

```
DELETE /users/{userId}
Authorization: Bearer {admin_token}
```

---

## 3. Persons

### 3.1 Get All Persons (My Entries)

```
GET /persons?search=ravi&sort=last_activity&page=1&limit=50
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "persons": [
      {
        "id": "uuid",
        "name": "Ravi Kumar",
        "phone": "+919876543210",
        "balance": 5000.00,
        "avatarColor": "#34C759",
        "lastActivityAt": "2026-07-13T08:00:00Z",
        "deleteScheduledAt": null,
        "linkedUser": {
          "id": "uuid",
          "name": "Ravi Kumar"
        }
      }
    ],
    "total": 5,
    "totalGive": 15000.00,
    "totalGet": 8500.00
  }
}
```

---

### 3.2 Get Shared Persons (Others' Entries With My Number)

```
GET /persons/shared
Authorization: Bearer {token}
```

---

### 3.3 Create Person

```
POST /persons
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Suresh Kumar",
  "phone": "+919876543220"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Suresh Kumar",
    "phone": "+919876543220",
    "balance": 0,
    "avatarColor": "#FF9500",
    "linkedUser": null,
    "createdAt": "2026-07-13T09:00:00Z"
  }
}
```

---

### 3.4 Get Single Person

```
GET /persons/{personId}
Authorization: Bearer {token}
```

---

### 3.5 Update Person

```
PATCH /persons/{personId}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Suresh K",
  "phone": "+919876543221"
}
```

---

### 3.6 Delete Person (Schedule)

```
DELETE /persons/{personId}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Person scheduled for deletion in 24 hours",
  "data": {
    "deleteScheduledAt": "2026-07-14T09:00:00Z"
  }
}
```

---

### 3.7 Undo Delete Person

```
POST /persons/{personId}/restore
Authorization: Bearer {token}
```

---

## 4. Transactions

### 4.1 Get Transactions for Person

```
GET /persons/{personId}/transactions?status=current&page=1&limit=50
Authorization: Bearer {token}
```

**Query Params:**
- `status`: `current` | `upcoming` | `all`
- `type`: `gave` | `got`
- `from`: ISO date
- `to`: ISO date
- `page`, `limit`: pagination

**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "gave",
        "amount": 500.00,
        "currentAmount": 512.34,
        "description": "Grocery money",
        "interestRate": 0.02,
        "interestType": "simple",
        "balanceAfter": 5000.00,
        "transactionDate": "2026-07-01T07:44:00Z",
        "status": "current",
        "createdAt": "2026-07-01T07:44:00Z"
      }
    ],
    "total": 15,
    "currentBalance": 5000.00
  }
}
```

---

### 4.2 Create Transaction

```
POST /persons/{personId}/transactions
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "type": "gave",
  "amount": 500.00,
  "description": "Grocery money",
  "transactionDate": "2026-07-13T09:00:00Z",
  "interestRate": 2.0,
  "interestType": "simple"
}
```

---

### 4.3 Get Single Transaction

```
GET /persons/{personId}/transactions/{transactionId}
Authorization: Bearer {token}
```

---

### 4.4 Update Transaction

```
PATCH /persons/{personId}/transactions/{transactionId}
Authorization: Bearer {token}
```

---

### 4.5 Delete Transaction

```
DELETE /persons/{personId}/transactions/{transactionId}
Authorization: Bearer {token}
```

---

### 4.6 Get Interest History for Transaction

```
GET /persons/{personId}/transactions/{transactionId}/interest-history
Authorization: Bearer {token}
```

---

## 5. Reports

### 5.1 Generate PDF Report

```
POST /persons/{personId}/reports/pdf
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "from": "2026-01-01",
  "to": "2026-07-13",
  "preset": "last_6_months"
}
```

**Response 200:** Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="creditbook-report-2026-07-13.pdf"
```

---

### 5.2 Generate CSV Export

```
POST /persons/{personId}/reports/csv
Authorization: Bearer {token}
```

---

### 5.3 Generate Excel Export

```
POST /persons/{personId}/reports/excel
Authorization: Bearer {token}
```

---

## 6. Notifications

### 6.1 Get Notifications

```
GET /notifications?category=all&is_read=false&page=1&limit=30
Authorization: Bearer {token}
```

---

### 6.2 Mark Notification Read

```
PATCH /notifications/{notificationId}/read
Authorization: Bearer {token}
```

---

### 6.3 Mark All Notifications Read

```
PATCH /notifications/read-all
Authorization: Bearer {token}
```

---

### 6.4 Delete Notification

```
DELETE /notifications/{notificationId}
Authorization: Bearer {token}
```

---

### 6.5 Get Unread Count

```
GET /notifications/unread-count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "byCategory": {
      "transaction": 3,
      "support": 1,
      "update": 1,
      "activation": 0,
      "announcement": 0
    }
  }
}
```

---

## 7. Support Chat

### 7.1 Get Messages

```
GET /support/messages?page=1&limit=50
Authorization: Bearer {token}
```

---

### 7.2 Send Message

```
POST /support/messages
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "message": "I need help with interest calculation"
}
```

---

### 7.3 [Admin] Get All Conversations

```
GET /support/conversations
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "userId": "uuid",
        "userName": "Ravi Kumar",
        "userPhone": "+919876543210",
        "lastMessage": "I need help with...",
        "lastMessageAt": "2026-07-13T09:00:00Z",
        "unreadCount": 2
      }
    ]
  }
}
```

---

### 7.4 [Admin] Get User's Messages

```
GET /support/conversations/{userId}/messages
Authorization: Bearer {admin_token}
```

---

### 7.5 [Admin] Reply to User

```
POST /support/conversations/{userId}/reply
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "message": "The interest is calculated daily at midnight."
}
```

---

## 8. App Updates

### 8.1 Check for Updates

```
GET /updates/check?platform=android&currentVersion=1.0.0
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "hasUpdate": true,
    "latestVersion": "1.2.0",
    "releaseNotes": "- Bug fixes\n- Performance improvements\n- New analytics dashboard",
    "downloadUrl": "https://cdn.creditbook.app/apk/creditbook-1.2.0.apk",
    "fileSizeBytes": 24567890,
    "isForced": false,
    "publishedAt": "2026-07-10T00:00:00Z"
  }
}
```

---

### 8.2 [Admin] Create App Version

```
POST /updates/versions
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "version": "1.2.0",
  "platform": "android",
  "releaseNotes": "- New features...",
  "downloadUrl": "https://...",
  "fileSizeBytes": 24567890,
  "isForced": false
}
```

---

### 8.3 [Admin] Publish Version

```
POST /updates/versions/{versionId}/publish
Authorization: Bearer {admin_token}
```

---

## 9. Family Groups

### 9.1 Get All Groups

```
GET /groups
Authorization: Bearer {token}
```

---

### 9.2 Create Group

```
POST /groups
Authorization: Bearer {admin_token}
```

---

### 9.3 Add Member to Group

```
POST /groups/{groupId}/members
Authorization: Bearer {admin_token}
```

---

### 9.4 Remove Member from Group

```
DELETE /groups/{groupId}/members/{userId}
Authorization: Bearer {admin_token}
```

---

## 10. Analytics (Admin)

### 10.1 Dashboard Stats

```
GET /analytics/dashboard
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 8,
    "activeUsers": 7,
    "pendingUsers": 1,
    "totalPersons": 45,
    "totalTransactions": 312,
    "totalAmountGave": 150000.00,
    "totalAmountGot": 87500.00,
    "transactionsThisMonth": 28,
    "newUsersThisMonth": 1,
    "interestEarned": 3450.00
  }
}
```

---

## 11. Push Tokens

### 11.1 Register Push Token

```
POST /push-tokens
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "token": "fcm_token_string",
  "platform": "fcm_android"
}
```

---

### 11.2 Delete Push Token

```
DELETE /push-tokens/{token}
Authorization: Bearer {token}
```

---

## 12. WebSocket Events

### Connection

```
ws://creditbook-api.onrender.com/ws
Headers: Authorization: Bearer {token}
```

### Emitted Events (Server → Client)

| Event | Payload | Trigger |
|-------|---------|---------|
| `balance_updated` | `{ personId, newBalance, totalGive, totalGet }` | Transaction created/updated/deleted |
| `transaction_created` | `{ transaction }` | New transaction in shared entry |
| `notification_new` | `{ notification }` | New notification for user |
| `support_message` | `{ message }` | New support chat message |
| `person_delete_started` | `{ personId, deleteAt }` | Person scheduled for deletion |
| `upcoming_moved` | `{ transactionId, personId }` | Upcoming → current |
| `user_activated` | `{}` | Admin activated account |

### Listened Events (Client → Server)

| Event | Payload |
|-------|---------|
| `support_typing` | `{ userId }` |
| `mark_read` | `{ notificationIds }` |

---

## 13. Error Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Phone number or password is incorrect",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong phone/password |
| `UNAUTHORIZED` | 401 | No or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `ACCOUNT_PENDING` | 403 | Account not yet activated |
| `ACCOUNT_SUSPENDED` | 403 | Account has been suspended |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 14. Rate Limiting

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Auth (login, register) | 10 requests | 15 minutes |
| All authenticated | 1000 requests | 1 hour |
| Report generation | 10 requests | 1 hour |
| Push token registration | 5 requests | 1 hour |

---

*Credit Book API Documentation — v1.0.0*
