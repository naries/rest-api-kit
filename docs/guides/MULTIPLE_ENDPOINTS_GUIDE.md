# Multiple createEndpoints and Multiple Base URLs

This guide demonstrates how to organize your API definitions across multiple files and work with multiple base URLs.

## ✅ Multiple createEndpoints Calls

You can now call `createEndpoints` multiple times on the same API instance to organize your endpoints in separate files.

### Example: Organizing by Feature

```typescript
// api/base.ts
import { createRestBase } from 'rest-api-kit';

export const api = createRestBase({
  baseUrl: 'https://api.example.com',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
```

```typescript
// api/auth.ts
import { api } from './base';

// Authentication endpoints
export const {
  useLogin,
  useSignup,
  useLogout,
  useForgotPassword,
  useResetPassword,
} = api.createEndpoints((builder) => ({
  login: builder({
    url: '/auth/login',
    params: { method: 'POST' },
  }),
  signup: builder({
    url: '/auth/signup',
    params: { method: 'POST' },
  }),
  logout: builder({
    url: '/auth/logout',
    params: { method: 'POST' },
  }),
  forgotPassword: builder({
    url: '/auth/forgot-password',
    params: { method: 'POST' },
  }),
  resetPassword: builder({
    url: '/auth/reset-password',
    params: { method: 'POST' },
  }),
}));
```

```typescript
// api/users.ts
import { api } from './base';

// User endpoints
export const {
  useGetUser,
  useUpdateUser,
  useDeleteUser,
  useGetUserProfile,
  useUploadAvatar,
} = api.createEndpoints((builder) => ({
  getUser: builder({
    url: '/users',
    params: { method: 'GET' },
  }),
  updateUser: builder({
    url: '/users',
    params: { method: 'PUT' },
  }),
  deleteUser: builder({
    url: '/users',
    params: { method: 'DELETE' },
  }),
  getUserProfile: builder({
    url: '/users/profile',
    params: { method: 'GET' },
  }),
  uploadAvatar: builder({
    url: '/users/avatar',
    params: { method: 'POST' },
  }),
}));
```

```typescript
// api/todos.ts
import { api } from './base';

// Todo endpoints
export const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} = api.createEndpoints((builder) => ({
  getTodos: builder({
    url: '/todos',
    params: { 
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),
  createTodo: builder({
    url: '/todos',
    params: { 
      method: 'POST',
      updates: ['getTodos'],
    },
  }),
  updateTodo: builder({
    url: '/todos',
    params: { 
      method: 'PUT',
      updates: ['getTodos'],
    },
  }),
  deleteTodo: builder({
    url: '/todos',
    params: { 
      method: 'DELETE',
      updates: ['getTodos'],
    },
  }),
}));
```

```typescript
// components/LoginPage.tsx
import React from 'react';
import { useLogin } from '../api/auth';

const LoginPage = () => {
  const [loginTrigger, loginState] = useLogin();
  
  const handleLogin = () => {
    loginTrigger({ email: 'user@example.com', password: 'password' });
  };
  
  return (
    <button onClick={handleLogin} disabled={loginState.isLoading}>
      {loginState.isLoading ? 'Logging in...' : 'Login'}
    </button>
  );
};
```

```typescript
// components/TodoList.tsx
import React, { useEffect } from 'react';
import { useGetTodos, useCreateTodo } from '../api/todos';

const TodoList = () => {
  const [getTodos, todosState] = useGetTodos();
  const [createTodo, createState] = useCreateTodo();
  
  useEffect(() => {
    getTodos();
  }, [getTodos]);
  
  return (
    <div>
      {todosState.data?.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
};
```

## ✅ Multiple Base URLs

You can create multiple `createRestBase` instances to work with different APIs or services.

### Example: Multiple APIs

```typescript
// api/mainApi.ts
import { createRestBase } from 'rest-api-kit';

// Main application API
export const mainApi = createRestBase({
  baseUrl: 'https://api.myapp.com/v1',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('mainApiToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const {
  useGetUser,
  useUpdateUser,
} = mainApi.createEndpoints((builder) => ({
  getUser: builder({
    url: '/users',
    params: { method: 'GET' },
  }),
  updateUser: builder({
    url: '/users',
    params: { method: 'PUT' },
  }),
}));
```

```typescript
// api/analyticsApi.ts
import { createRestBase } from 'rest-api-kit';

// Analytics/tracking API
export const analyticsApi = createRestBase({
  baseUrl: 'https://analytics.myapp.com/v2',
  prepareHeaders: (headers) => {
    headers.set('X-API-Key', process.env.ANALYTICS_API_KEY || '');
    return headers;
  },
});

export const {
  useTrackEvent,
  useGetAnalytics,
} = analyticsApi.createEndpoints((builder) => ({
  trackEvent: builder({
    url: '/events',
    params: { method: 'POST' },
  }),
  getAnalytics: builder({
    url: '/analytics',
    params: { method: 'GET' },
  }),
}));
```

```typescript
// api/paymentApi.ts
import { createRestBase } from 'rest-api-kit';

// Payment processing API
export const paymentApi = createRestBase({
  baseUrl: 'https://payments.stripe.com/v1',
  prepareHeaders: (headers) => {
    headers.set('Authorization', `Bearer ${process.env.STRIPE_SECRET_KEY}`);
    return headers;
  },
});

export const {
  useCreatePayment,
  useGetPaymentStatus,
  useRefundPayment,
} = paymentApi.createEndpoints((builder) => ({
  createPayment: builder({
    url: '/charges',
    params: { method: 'POST' },
  }),
  getPaymentStatus: builder({
    url: '/charges',
    params: { method: 'GET' },
  }),
  refundPayment: builder({
    url: '/refunds',
    params: { method: 'POST' },
  }),
}));
```

```typescript
// components/CheckoutPage.tsx
import React from 'react';
import { useGetUser } from '../api/mainApi';
import { useCreatePayment } from '../api/paymentApi';
import { useTrackEvent } from '../api/analyticsApi';

const CheckoutPage = () => {
  const [getUser, userState] = useGetUser();
  const [createPayment, paymentState] = useCreatePayment();
  const [trackEvent] = useTrackEvent();
  
  const handleCheckout = () => {
    // Create payment
    createPayment({ amount: 1000, currency: 'usd' });
    
    // Track event
    trackEvent({ event: 'checkout_initiated', userId: userState.data?.id });
  };
  
  return (
    <button onClick={handleCheckout} disabled={paymentState.isLoading}>
      {paymentState.isLoading ? 'Processing...' : 'Complete Purchase'}
    </button>
  );
};
```

## 🎯 Benefits

### Organization
- **Separate concerns**: Keep authentication, users, todos, etc. in separate files
- **Easier maintenance**: Find and update endpoints by feature
- **Team collaboration**: Multiple developers can work on different API files

### Flexibility
- **Multiple services**: Connect to different APIs with different configurations
- **Different authentication**: Each API can have its own auth strategy
- **Environment-specific**: Easily switch between dev/staging/prod URLs

### Scalability
- **Growing APIs**: Add new endpoints without cluttering a single file
- **Microservices**: Connect to multiple microservices easily
- **Third-party APIs**: Integrate external services alongside your main API

## ⚠️ Important Notes

### Duplicate Endpoint Names
If you define the same endpoint name multiple times, the library will warn you and use the latest definition:

```typescript
// First definition
const { useGetUser } = api.createEndpoints((builder) => ({
  getUser: builder({ url: '/users/1', params: { method: 'GET' } }),
}));

// Second definition (will override and show warning)
const { useGetUser: useGetUser2 } = api.createEndpoints((builder) => ({
  getUser: builder({ url: '/users/2', params: { method: 'GET' } }),
}));

// Console warning: "Duplicate endpoint names detected: getUser. 
// The new endpoints will override the previous ones."
```

### Hook Accumulation
Each call to `createEndpoints` returns an object with ALL previously created hooks plus the new ones:

```typescript
const api1 = api.createEndpoints((builder) => ({
  endpoint1: builder({...}),
}));
// api1 has: useEndpoint1

const api2 = api.createEndpoints((builder) => ({
  endpoint2: builder({...}),
}));
// api2 has: useEndpoint1, useEndpoint2 ✅

// Both are available on api2 because hooks accumulate!
```

## 📚 Best Practices

1. **One shared base per API**: Create one `createRestBase` instance per base URL
2. **Organize by feature**: Group related endpoints in separate files
3. **Export immediately**: Destructure and export hooks right away
4. **Avoid duplicates**: Use unique endpoint names across all files
5. **Centralize config**: Keep base configuration in a shared file
