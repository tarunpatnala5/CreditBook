# Credit Book — Analytics Dashboard Documentation
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Overview

The Analytics Dashboard is exclusively available to the Admin. It provides real-time insights into the system's usage, financial flows, and user activity. It is accessible via Settings → Analytics Dashboard.

---

## 2. Dashboard Metrics

### 2.1 Summary Cards (Real-time)
| Metric | Source | Update Frequency |
|--------|--------|-----------------|
| Total Registered Users | users table | Real-time |
| Active Users (30 days) | users.last_active_at | Real-time |
| Pending Activations | users.status = pending | Real-time |
| Total Persons Created | persons table | Real-time |
| Total Transactions | transactions table | Real-time |
| Transactions This Month | transactions.created_at | Real-time |
| Total Amount in System | SUM(transactions.current_amount) | Daily |
| Total Interest Generated | SUM(interest_history.interest_added) | Daily |

### 2.2 Charts

**Monthly Transaction Volume (Bar Chart)**
- X-axis: Last 12 months
- Y-axis: Number of transactions
- Bars: Gave (red) / Got (green) split

**User Activity Timeline (Line Chart)**
- X-axis: Last 30 days
- Y-axis: Active users per day
- Single blue line

**Money Flow (Donut Chart)**
- Segments: Total Give / Total Get / Interest

**Top Active Users (Ranked List)**
- Users ranked by transaction count (last 30 days)
- Shows name + phone + transaction count + last active

---

## 3. Implementation

### 3.1 Analytics Service

```javascript
// services/analytics.service.js
async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    totalPersons,
    totalTransactions,
    txnThisMonth,
    moneyFlow,
    monthlyVolume,
    topUsers,
  ] = await Promise.all([
    db.users.count({ where: { status: 'active', deletedAt: null } }),
    db.users.count({
      where: {
        status: 'active',
        deletedAt: null,
        lastActiveAt: { gte: subDays(new Date(), 30) }
      }
    }),
    db.users.count({ where: { status: 'pending', deletedAt: null } }),
    db.persons.count({ where: { deletedAt: null } }),
    db.transactions.count({ where: { deletedAt: null } }),
    db.transactions.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startOfMonth(new Date()) }
      }
    }),
    db.$queryRaw`
      SELECT 
        SUM(CASE WHEN type = 'gave' THEN current_amount ELSE 0 END) as total_gave,
        SUM(CASE WHEN type = 'got' THEN current_amount ELSE 0 END) as total_got
      FROM transactions WHERE deleted_at IS NULL AND status = 'current'
    `,
    getMonthlyVolume(),
    getTopActiveUsers(),
  ]);

  return {
    totalUsers, activeUsers, pendingUsers, totalPersons,
    totalTransactions, txnThisMonth, moneyFlow: moneyFlow[0],
    monthlyVolume, topUsers
  };
}
```

### 3.2 Charts Library
- **Web:** Recharts (React, free, MIT license)
- **Flutter:** fl_chart (Flutter, free, MIT license)

---

*Credit Book Analytics Dashboard Documentation — v1.0.0*
