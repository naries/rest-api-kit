# Common Usage Issues and Solutions

## ✅ Correct Usage

### 1. Create API once at the module level

```typescript
// api/index.ts
import { createRestBase } from 'rest-api-kit';

export const api = createRestBase({
  baseUrl: 'https://api.example.com',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
```

### 2. Create endpoints once and export hooks

```typescript
// api/auth.ts
import { api } from './index';

// ✅ CORRECT: Call createEndpoints ONCE and destructure immediately
export const {
  useLogin,
  useSignup,
  useVerifyAccount,
} = api.createEndpoints((builder) => ({
  login: builder({
    url: '/auth/login',
    params: { method: 'POST' },
  }),
  signup: builder({
    url: '/auth/signup',
    params: { method: 'POST' },
  }),
  verifyAccount: builder({
    url: '/auth/verify',
    params: { method: 'POST' },
  }),
}));
```

### 3. Use hooks in components

```typescript
// components/LoginForm.tsx
import React from 'react';
import { useLogin } from '../api/auth';

const LoginForm = () => {
  const [loginTrigger, loginState] = useLogin();
  
  const handleLogin = () => {
    loginTrigger({ email: '...', password: '...' });
  };
  
  return (
    <div>
      <button onClick={handleLogin} disabled={loginState.isLoading}>
        {loginState.isLoading ? 'Logging in...' : 'Login'}
      </button>
      {loginState.isSuccess && <p>Login successful!</p>}
      {loginState.error && <p>Error: {String(loginState.error)}</p>}
    </div>
  );
};
```

## ❌ Common Mistakes

### Mistake 1: Storing result in variable then exporting

```typescript
// ❌ WRONG
const authInjector = api.createEndpoints((builder) => ({...}));

export const {
  useLogin,
  useSignup,
} = authInjector; // This works but is unnecessary

// ✅ BETTER: Destructure immediately
export const {
  useLogin,
  useSignup,
} = api.createEndpoints((builder) => ({...}));
```

### Mistake 2: Calling createEndpoints multiple times

```typescript
// ❌ WRONG
// In file1.ts
const { useLogin } = api.createEndpoints(...);

// In file2.ts  
const { useGetTodos } = api.createEndpoints(...); // Second call won't create new hooks!
```

```typescript
// ✅ CORRECT: Call once, export all hooks
// api/endpoints.ts
export const {
  useLogin,
  useGetTodos,
  useCreateTodo,
} = api.createEndpoints((builder) => ({
  login: builder({...}),
  getTodos: builder({...}),
  createTodo: builder({...}),
}));
```

### Mistake 3: Accessing hooks property

```typescript
// ❌ WRONG
const result = api.createEndpoints(...);
const { useLogin } = result.hooks; // No .hooks property exists!

// ✅ CORRECT
const { useLogin } = api.createEndpoints(...);
```

### Mistake 4: Trying to use result as an object

```typescript
// ❌ WRONG
const result = api.createEndpoints(...);
const [trigger, state] = result.useLogin(); // Double invocation

// ✅ CORRECT
const { useLogin } = api.createEndpoints(...);
const [trigger, state] = useLogin();
```

## 🔍 Debugging

If you're getting "useXXX is not a function", check:

1. **Is the hook actually defined?**
   ```typescript
   const hooks = api.createEndpoints(...);
   console.log(Object.keys(hooks)); // Should include your hook names
   console.log(typeof hooks.useLogin); // Should be 'function'
   ```

2. **Are you calling createEndpoints multiple times?**
   - Check your console for warnings about multiple initialization

3. **Is the endpoint name matching?**
   ```typescript
   api.createEndpoints((builder) => ({
     login: builder({...}), // Creates useLogin
     getUser: builder({...}), // Creates useGetUser (camelCase preserved)
     get_todos: builder({...}), // Creates useGet_todos (underscore preserved)
   }));
   ```

4. **Are you using the correct import?**
   ```typescript
   // Make sure you're importing from the right file
   import { useLogin } from '../api/auth'; // ✅
   import { useLogin } from '../api/wrong-file'; // ❌
   ```
