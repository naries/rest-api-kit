# Quick Start: Multiple Endpoints & APIs

> **New in v0.0.53**: Organize your API calls across multiple files and connect to multiple services! 🎉

## 🚀 5-Minute Quick Start

### Scenario 1: Organize One API Across Files

**Problem**: All your endpoints in one huge file 😰

**Solution**: Split them by feature! 

```typescript
// 1️⃣ Create shared base (api/base.ts)
import { createRestBase } from 'rest-api-kit';

export const api = createRestBase({
  baseUrl: 'https://api.myapp.com',
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// 2️⃣ Create auth endpoints (api/auth.ts)
import { api } from './base';

export const { useLogin, useSignup, useLogout } = api.createEndpoints((builder) => ({
  login: builder({ url: '/auth/login', params: { method: 'POST' } }),
  signup: builder({ url: '/auth/signup', params: { method: 'POST' } }),
  logout: builder({ url: '/auth/logout', params: { method: 'POST' } }),
}));

// 3️⃣ Create user endpoints (api/users.ts)
import { api } from './base';

export const { useGetUser, useUpdateUser } = api.createEndpoints((builder) => ({
  getUser: builder({ url: '/users', params: { method: 'GET' } }),
  updateUser: builder({ url: '/users', params: { method: 'PUT' } }),
}));

// 4️⃣ Create todo endpoints (api/todos.ts)
import { api } from './base';

export const { useGetTodos, useCreateTodo } = api.createEndpoints((builder) => ({
  getTodos: builder({ url: '/todos', params: { method: 'GET' } }),
  createTodo: builder({ url: '/todos', params: { method: 'POST' } }),
}));

// 5️⃣ Use in components
import { useLogin } from '../api/auth';
import { useGetTodos } from '../api/todos';

function MyComponent() {
  const [login, loginState] = useLogin();
  const [getTodos, todosState] = useGetTodos();
  // ... use them!
}
```

**Result**: Clean, organized, maintainable! ✨

---

### Scenario 2: Connect to Multiple APIs

**Problem**: Need to call your backend, analytics, and payment APIs 🤯

**Solution**: Create multiple base instances!

```typescript
// 1️⃣ Main API (api/mainApi.ts)
import { createRestBase } from 'rest-api-kit';

const mainApi = createRestBase({
  baseUrl: 'https://api.myapp.com',
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${mainToken}`);
    return headers;
  },
});

export const { useGetUser } = mainApi.createEndpoints((builder) => ({
  getUser: builder({ url: '/users', params: { method: 'GET' } }),
}));

// 2️⃣ Analytics API (api/analyticsApi.ts)
const analyticsApi = createRestBase({
  baseUrl: 'https://analytics.myapp.com',
  prepareHeaders: (headers) => {
    headers.set('X-API-Key', analyticsKey);
    return headers;
  },
});

export const { useTrackEvent } = analyticsApi.createEndpoints((builder) => ({
  trackEvent: builder({ url: '/events', params: { method: 'POST' } }),
}));

// 3️⃣ Payment API (api/paymentApi.ts)
const paymentApi = createRestBase({
  baseUrl: 'https://api.stripe.com',
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${stripeKey}`);
    return headers;
  },
});

export const { useCreatePayment } = paymentApi.createEndpoints((builder) => ({
  createPayment: builder({ url: '/charges', params: { method: 'POST' } }),
}));

// 4️⃣ Use all three in one component!
import { useGetUser } from '../api/mainApi';
import { useTrackEvent } from '../api/analyticsApi';
import { useCreatePayment } from '../api/paymentApi';

function CheckoutPage() {
  const [getUser, userState] = useGetUser();
  const [trackEvent] = useTrackEvent();
  const [createPayment, paymentState] = useCreatePayment();
  
  const handleCheckout = () => {
    trackEvent({ event: 'checkout_start' });
    createPayment({ amount: 1000 });
  };
  
  return <button onClick={handleCheckout}>Pay Now</button>;
}
```

**Result**: Clean separation of different services! 🎯

---

## 📁 Recommended Structure

### For Large Apps (Multiple Files per API)
```
src/
├── api/
│   ├── base.ts          # Shared API base
│   ├── auth.ts          # Auth endpoints (5-10 endpoints)
│   ├── users.ts         # User endpoints (5-10 endpoints)
│   ├── todos.ts         # Todo endpoints (5-10 endpoints)
│   ├── posts.ts         # Post endpoints (5-10 endpoints)
│   └── index.ts         # Re-export all
└── components/
    ├── LoginForm.tsx    # Uses auth hooks
    ├── UserProfile.tsx  # Uses user hooks
    └── TodoList.tsx     # Uses todo hooks
```

### For Multiple Services
```
src/
├── api/
│   ├── mainApi.ts       # Main backend (https://api.myapp.com)
│   ├── analyticsApi.ts  # Analytics (https://analytics.myapp.com)
│   ├── paymentApi.ts    # Payments (https://api.stripe.com)
│   ├── cmsApi.ts        # Content (https://cms.myapp.com)
│   └── index.ts         # Re-export all
└── components/
    └── CheckoutPage.tsx # Uses all services
```

---

## ✅ Checklist

### To Organize One API:
- [ ] Create `api/base.ts` with `createRestBase`
- [ ] Create feature files (auth.ts, users.ts, etc.)
- [ ] Call `createEndpoints` in each file
- [ ] Export hooks from each file
- [ ] Optionally create `api/index.ts` to re-export all
- [ ] Import hooks where needed

### To Use Multiple APIs:
- [ ] Create separate `createRestBase` for each API
- [ ] Configure each with its own baseUrl and headers
- [ ] Call `createEndpoints` on each instance
- [ ] Export hooks from each API file
- [ ] Use hooks together in components

---

## 🎓 Learn More

- **[Complete Guide](./MULTIPLE_ENDPOINTS_GUIDE.md)** - In-depth examples and patterns
- **[Organized API Example](./examples/organized-api/)** - Full working example with components
- **[Multiple APIs Example](./examples/multiple-apis/)** - Multi-service integration example
- **[Main Documentation](./README.md)** - Full library docs

---

## 💡 Tips

### Naming Convention
```typescript
// Feature-based files
api/auth.ts      → useLogin, useSignup, useLogout
api/users.ts     → useGetUser, useUpdateUser, useDeleteUser
api/todos.ts     → useGetTodos, useCreateTodo, useUpdateTodo

// Service-based files
api/mainApi.ts       → useGetUser, useGetProducts
api/analyticsApi.ts  → useTrackEvent, useGetAnalytics
api/paymentApi.ts    → useCreatePayment, useRefund
```

### Import Patterns
```typescript
// Option 1: Import from specific files (recommended for clarity)
import { useLogin } from '@/api/auth';
import { useGetUser } from '@/api/users';

// Option 2: Import from centralized index (convenient)
import { useLogin, useGetUser } from '@/api';

// Both work! Choose what your team prefers.
```

### Avoid Duplicates
```typescript
// ❌ Don't define the same endpoint name in multiple files
// api/auth.ts
export const { useGetUser } = api.createEndpoints(...); // ❌

// api/users.ts  
export const { useGetUser } = api.createEndpoints(...); // ❌ Duplicate!

// ✅ Use unique names
// api/auth.ts
export const { useGetAuthUser } = api.createEndpoints(...); // ✅

// api/users.ts
export const { useGetUser } = api.createEndpoints(...); // ✅
```

---

**Ready to organize your API?** Start with the examples above! 🚀
