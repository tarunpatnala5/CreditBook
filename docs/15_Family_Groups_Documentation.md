# Credit Book — Family Groups Documentation
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Overview

Family Groups allow the Admin to organize users into named groups for visibility control and group-level analytics. This is a Phase 1 foundation feature; advanced group sharing is a future expansion.

---

## 2. Group Concepts

| Concept | Description |
|---------|-------------|
| Group | A named collection of family users |
| Group Owner | The admin who created the group |
| Group Member | A user belonging to the group |
| Group Visibility | Future: share a person ledger with all group members |

---

## 3. Group Operations (Admin Only)

### Create Group
```
POST /groups
{ "name": "Nuclear Family", "description": "Close family members" }
```

### Add Member
```
POST /groups/:groupId/members
{ "userId": "uuid" }
```

### Remove Member
```
DELETE /groups/:groupId/members/:userId
```

### List Groups
```
GET /groups
```

---

## 4. Current Limitations (Phase 1)

In Phase 1, groups are administrative only:
- Admin can organize users into groups
- No user-facing group features in the UI
- Groups used for analytics segmentation

**Future (Phase 2 of Groups):**
- Share a person's ledger with all members of a group
- Group-level dashboard (total group balance)
- Group announcements
- Group member can see all ledgers within the group

---

## 5. Database Structure

```sql
-- family_groups
-- family_group_members
-- (see Database Design doc for full schema)
```

---

*Credit Book Family Groups Documentation — v1.0.0*
