# Credit Book — Coding Standards
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. JavaScript / TypeScript Standards

### 1.1 General

- Use TypeScript everywhere (`.ts`, `.tsx`)
- Strict mode enabled in `tsconfig.json`
- No `any` types — use proper typing or `unknown`
- Explicit return types on all functions
- No `var` — use `const` (preferred) or `let`

### 1.2 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `totalBalance` |
| Functions | camelCase | `calculateInterest()` |
| Classes | PascalCase | `TransactionService` |
| Interfaces | PascalCase | `ITransaction` |
| Types | PascalCase | `TransactionType` |
| Enums | PascalCase | `UserRole` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Files | kebab-case | `transaction.service.ts` |
| React components | PascalCase | `TransactionCard.tsx` |
| Hooks | camelCase with `use` | `useTransactions.ts` |
| CSS classes | kebab-case | `transaction-card` |
| CSS variables | kebab-case | `--color-primary` |

### 1.3 Function Rules

```typescript
// ✅ Good: explicit return type, async/await
async function createTransaction(data: CreateTransactionDto): Promise<Transaction> {
  const validated = createTransactionSchema.parse(data);
  return await db.transactions.create({ data: validated });
}

// ❌ Bad: implicit return type, .then() chain
function createTransaction(data) {
  return db.transactions.create({ data }).then(t => t);
}
```

### 1.4 Error Handling

```typescript
// ✅ Good: typed errors, proper handling
try {
  const result = await someOperation();
  return result;
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2025') throw new NotFoundError('Record not found');
  }
  logger.error('Unexpected error', { error, context: 'someOperation' });
  throw new InternalError('An unexpected error occurred');
}
```

---

## 2. React / Web Standards

### 2.1 Component Structure

```tsx
// ComponentName.tsx
import React, { useState, useCallback } from 'react';
import type { FC } from 'react';

// 1. Type definitions
interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
}

// 2. Component (arrow function)
const TransactionCard: FC<TransactionCardProps> = ({ transaction, onEdit }) => {
  // 3. State at top
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 4. Handlers (useCallback for functions passed as props)
  const handleEdit = useCallback(() => {
    onEdit(transaction.id);
  }, [transaction.id, onEdit]);
  
  // 5. Effects
  // useEffect(() => { ... }, []);
  
  // 6. Derived values
  const formattedAmount = formatCurrency(transaction.amount);
  
  // 7. Render
  return (
    <div className="transaction-card" onClick={handleEdit}>
      <span className="amount">{formattedAmount}</span>
    </div>
  );
};

// 8. Default export
export default TransactionCard;
```

### 2.2 CSS Rules

```css
/* ✅ Good: use design tokens */
.transaction-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  color: var(--label-primary);
}

/* ❌ Bad: hardcoded values */
.transaction-card {
  background: #FFFFFF;
  border-radius: 13px;
  padding: 16px;
  color: #000000;
}
```

---

## 3. Flutter / Dart Standards

### 3.1 Naming

| Type | Convention |
|------|-----------|
| Classes/Widgets | PascalCase: `TransactionCard` |
| Functions/variables | camelCase: `calculateBalance` |
| Private | Underscore prefix: `_handleTap` |
| Constants | lowerCamelCase: `kMaxRetries` |
| Files | snake_case: `transaction_card.dart` |

### 3.2 Widget Structure

```dart
// transaction_card.dart
class TransactionCard extends StatelessWidget {
  const TransactionCard({
    super.key,
    required this.transaction,
    required this.onTap,
  });

  final Transaction transaction;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: context.colorScheme.cardBackground,
          borderRadius: BorderRadius.circular(AppRadius.card),
        ),
        // ...
      ),
    );
  }
}
```

---

## 4. API / Backend Standards

### 4.1 Route → Controller → Service Pattern

```
Request → Route (validation) → Controller (HTTP concerns) → Service (business logic) → Database
```

```typescript
// route: auth.routes.ts
router.post('/login', validate(loginSchema), authController.login);

// controller: auth.controller.ts
async login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.json(successResponse(result));
}

// service: auth.service.ts
async login(data: LoginDto): Promise<LoginResult> {
  const user = await db.users.findUnique({ where: { phone: data.phone } });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  const passwordValid = await verifyPassword(data.password, user.passwordHash);
  if (!passwordValid) throw new UnauthorizedError('Invalid credentials');
  // ... issue tokens
}
```

### 4.2 HTTP Status Codes

| Situation | Status Code |
|-----------|------------|
| GET success | 200 |
| POST created | 201 |
| No content (DELETE) | 204 |
| Bad request | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict (duplicate) | 409 |
| Rate limited | 429 |
| Server error | 500 |

---

*Credit Book Coding Standards — v1.0.0*
