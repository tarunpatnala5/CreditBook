# Credit Book — State Management Specification
**Version:** 1.0.0 | **Date:** 2026-07-13

---

## 1. Overview

### Web: Zustand + React Query
- **Zustand:** Global application state (auth, UI, settings, offline queue)
- **React Query (TanStack Query):** Server state (data fetching, caching, mutations)

### Flutter: Riverpod + Drift
- **Riverpod:** Reactive state management
- **Drift:** Local database (offline state)

---

## 2. Web State Architecture

### 2.1 Auth Store (Zustand)

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User, tokens: Tokens) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: (user, tokens) => set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      }),
      
      logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }),
      
      updateUser: (updates) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      setToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'creditbook-auth',
      partialize: (state) => ({ user: state.user }), // Only persist user, not token
    }
  )
);
```

### 2.2 Settings Store (Zustand)

```typescript
interface SettingsState {
  darkMode: boolean | null; // null = system default
  pinEnabled: boolean;
  biometricEnabled: boolean;
  
  setDarkMode: (value: boolean | null) => void;
  setPinEnabled: (value: boolean) => void;
  setBiometricEnabled: (value: boolean) => void;
}
```

### 2.3 Notification Store (Zustand)

```typescript
interface NotificationState {
  unreadCount: number;
  hasUpdate: boolean;
  
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  setHasUpdate: (value: boolean) => void;
}
```

### 2.4 Offline Store (Zustand)

```typescript
interface OfflineState {
  isOnline: boolean;
  pendingOperations: PendingOperation[];
  
  setOnline: (value: boolean) => void;
  addPendingOperation: (op: PendingOperation) => void;
  removePendingOperation: (id: string) => void;
  clearPendingOperations: () => void;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'transaction' | 'person';
  payload: unknown;
  timestamp: Date;
  retries: number;
}
```

---

## 3. React Query Keys

```typescript
// constants/queryKeys.ts
export const queryKeys = {
  // Persons
  persons: ['persons'] as const,
  personsList: (filters?: PersonFilters) => [...queryKeys.persons, 'list', filters],
  person: (id: string) => [...queryKeys.persons, 'detail', id],
  sharedPersons: ['shared-persons'] as const,
  
  // Transactions
  transactions: (personId: string, status?: TransactionStatus) => 
    ['transactions', personId, status],
  transaction: (personId: string, txnId: string) => 
    ['transactions', personId, 'detail', txnId],
  interestHistory: (txnId: string) => ['interest-history', txnId],
  
  // Notifications
  notifications: (filters?: NotifFilters) => ['notifications', filters],
  notificationCount: ['notification-count'] as const,
  
  // Auth
  currentUser: ['current-user'] as const,
  
  // Admin
  users: (status?: UserStatus) => ['users', status],
  analytics: ['analytics'] as const,
  supportConversations: ['support-conversations'] as const,
  supportMessages: (userId: string) => ['support-messages', userId],
  
  // Updates
  updateCheck: (platform: string, version: string) => ['update-check', platform, version],
};
```

---

## 4. React Query Examples

### 4.1 Fetching Persons

```typescript
// hooks/usePersons.ts
export function usePersons(search?: string) {
  return useQuery({
    queryKey: queryKeys.personsList({ search }),
    queryFn: () => personsApi.getAll({ search }),
    staleTime: 30_000,          // 30 seconds before refetch
    gcTime: 5 * 60_000,         // 5 minutes cache
    placeholderData: keepPreviousData,
  });
}
```

### 4.2 Creating a Transaction

```typescript
// hooks/useTransactions.ts
export function useCreateTransaction(personId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionDto) => 
      transactionsApi.create(personId, data),
    
    // Optimistic update
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions(personId) });
      const previous = queryClient.getQueryData(queryKeys.transactions(personId));
      
      queryClient.setQueryData(
        queryKeys.transactions(personId),
        (old: Transaction[]) => [
          { ...newTransaction, id: 'optimistic', createdAt: new Date() },
          ...old
        ]
      );
      
      return { previous };
    },
    
    // On error: rollback
    onError: (err, _, context) => {
      queryClient.setQueryData(queryKeys.transactions(personId), context?.previous);
      toast.error('Failed to save transaction');
    },
    
    // On success: invalidate to get real data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(personId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.personsList() });
      toast.success('Transaction saved');
    },
  });
}
```

---

## 5. Flutter State (Riverpod)

### 5.1 Auth Provider

```dart
// features/auth/auth_provider.dart
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() => const AuthState.unauthenticated();
  
  Future<void> login(String phone, String password) async {
    state = const AuthState.loading();
    try {
      final result = await authRepository.login(phone, password);
      await secureStorage.saveTokens(result.tokens);
      state = AuthState.authenticated(user: result.user);
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }
  
  Future<void> logout() async {
    await authRepository.logout();
    await secureStorage.clearTokens();
    state = const AuthState.unauthenticated();
  }
}
```

### 5.2 Persons Provider

```dart
@riverpod
Future<List<Person>> persons(PersonsRef ref) async {
  final repository = ref.watch(personRepositoryProvider);
  
  // Listen for WebSocket updates — auto-invalidate when balance changes
  ref.listen(webSocketProvider, (_, event) {
    if (event?.type == 'balance_updated') ref.invalidateSelf();
  });
  
  return repository.getPersons();
}
```

---

## 6. WebSocket Integration

```typescript
// hooks/useWebSocket.ts
export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const notificationStore = useNotificationStore();
  
  useEffect(() => {
    if (!accessToken) return;
    
    const socket = io(WS_URL, {
      auth: { token: accessToken }
    });
    
    socket.on('balance_updated', ({ personId, totalGive, totalGet }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.personsList() });
      queryClient.invalidateQueries({ queryKey: queryKeys.person(personId) });
    });
    
    socket.on('notification_new', (notification) => {
      notificationStore.incrementUnread();
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount });
    });
    
    socket.on('support_reply_received', (message) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supportMessages(message.userId) });
    });
    
    return () => { socket.disconnect(); };
  }, [accessToken]);
}
```

---

*Credit Book State Management Specification — v1.0.0*
