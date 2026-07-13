# Credit Book — Error Handling Guide
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Error Hierarchy

```
BaseError
  ├── ValidationError      (400) — Invalid input
  ├── UnauthorizedError    (401) — Not authenticated
  ├── ForbiddenError       (403) — Not authorized
  ├── NotFoundError        (404) — Resource not found
  ├── ConflictError        (409) — Duplicate / conflict
  ├── RateLimitError       (429) — Too many requests
  └── InternalError        (500) — Server error
```

---

## 2. Custom Error Classes (API)

```typescript
// utils/errors.ts
export class BaseError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class InternalError extends BaseError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500);
  }
}
```

---

## 3. Global Error Handler (Express)

```typescript
// middleware/errorHandler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log all errors
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
  });

  // Handle known errors
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      }
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
      return;
    }
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Duplicate entry' } });
      return;
    }
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.errors,
      }
    });
    return;
  }

  // Unknown errors — don't expose internals
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    }
  });
}
```

---

## 4. Frontend Error Handling

### 4.1 Axios Interceptor

```typescript
// api/client.ts
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const { response, config } = error;
    
    // 401: Try token refresh
    if (response?.status === 401 && !config?._retried) {
      config._retried = true;
      try {
        const newToken = await refreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(config);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return;
      }
    }
    
    // 403: Not activated
    if (response?.status === 403) {
      const code = response.data?.error?.code;
      if (code === 'ACCOUNT_PENDING') {
        toast.error('Your account is pending activation. Contact admin.');
        return;
      }
    }
    
    // Network error
    if (!response) {
      // Don't show error if intentionally offline
      if (!navigator.onLine) return Promise.reject(error);
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);
```

### 4.2 React Error Boundary

```tsx
// components/shared/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('React Error Boundary caught:', { error, info });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h2>Something went wrong</h2>
          <p>Please refresh the page. If the issue persists, contact admin.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## 5. User-Facing Error Messages

**Rule:** Never show technical error messages to users. Always translate to human-friendly language.

| Technical Error | User-Friendly Message |
|-----------------|----------------------|
| Network timeout | "Connection timed out. Please check your internet." |
| 401 Unauthorized | "Your session has expired. Please sign in again." |
| 403 Forbidden | "You don't have permission to do this." |
| 404 Not Found | "This item no longer exists." |
| 429 Rate Limited | "You're doing that too fast. Please wait a moment." |
| 500 Server Error | "Something went wrong on our end. Please try again." |
| Validation error | Show specific field errors (e.g., "Amount must be greater than 0") |
| Offline | "You're offline. Changes will sync when connected." |

---

## 6. Flutter Error Handling

```dart
// Riverpod error handling pattern
AsyncValue.when(
  data: (data) => DataWidget(data),
  loading: () => const LoadingWidget(),
  error: (error, stack) {
    final message = _getErrorMessage(error);
    return ErrorWidget(message: message, onRetry: ref.invalidateSelf);
  },
)

String _getErrorMessage(Object error) {
  if (error is NetworkException) return 'Check your internet connection';
  if (error is UnauthorizedException) return 'Please sign in again';
  if (error is NotFoundException) return 'Item not found';
  return 'Something went wrong. Please try again.';
}
```

---

*Credit Book Error Handling Guide — v1.0.0*
