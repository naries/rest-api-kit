# Organized API Example

This example demonstrates how to organize your REST API endpoints across multiple files using the new **multiple `createEndpoints`** feature in Rest API Kit v0.0.53+.

## 📁 Project Structure

```
src/
├── api/
│   ├── base.ts          # API base configuration
│   ├── auth.ts          # Authentication endpoints
│   ├── users.ts         # User management endpoints
│   ├── todos.ts         # Todo CRUD endpoints
│   └── index.ts         # Re-export all hooks
├── components/
│   ├── LoginForm.tsx    # Uses auth hooks
│   ├── UserProfile.tsx  # Uses user hooks
│   └── TodoList.tsx     # Uses todo hooks
└── App.tsx
```

## 🚀 Benefits of This Organization

### ✅ Better Organization
- Each API domain has its own file
- Easy to find and maintain endpoints
- Clear separation of concerns

### ✅ Team Collaboration
- Multiple developers can work on different API files without conflicts
- Easy to review changes in pull requests
- Clear ownership of different API domains

### ✅ Scalability
- Add new endpoints without cluttering existing files
- Easy to add new API domains
- Supports growing applications

### ✅ Reusability
- Import only the hooks you need
- Share common hooks across components
- Clear dependencies

## 📝 Implementation

See the example files in this directory for the complete implementation:

1. **`api/base.ts`** - Shared API base configuration
2. **`api/auth.ts`** - Authentication endpoints (login, signup, logout)
3. **`api/users.ts`** - User management (get, update, delete)
4. **`api/todos.ts`** - Todo operations (CRUD)
5. **`api/index.ts`** - Centralized exports
6. **`components/`** - React components using the hooks

## 🎯 Key Concepts

### Multiple createEndpoints Calls

You can call `createEndpoints` multiple times on the same API instance:

```typescript
// First call - auth endpoints
const auth = api.createEndpoints((builder) => ({
  login: builder({...}),
  signup: builder({...}),
}));

// Second call - user endpoints (accumulates!)
const users = api.createEndpoints((builder) => ({
  getUser: builder({...}),
  updateUser: builder({...}),
}));

// Both auth and user hooks are available on both objects!
// auth has: useLogin, useSignup, useGetUser, useUpdateUser ✅
// users has: useLogin, useSignup, useGetUser, useUpdateUser ✅
```

### Hook Accumulation

Each call to `createEndpoints` returns ALL hooks (previous + new ones):

```typescript
// api/auth.ts
export const { useLogin, useSignup } = api.createEndpoints(...);

// api/users.ts  
export const { useGetUser, useUpdateUser } = api.createEndpoints(...);
// This object ALSO has useLogin and useSignup!
// But we only export the new ones we defined here
```

### Centralized Export

The `api/index.ts` file re-exports all hooks for convenience:

```typescript
// components/MyComponent.tsx
// You can import from individual files
import { useLogin } from '../api/auth';
import { useGetUser } from '../api/users';

// OR import from the centralized index
import { useLogin, useGetUser } from '../api';
```

## 🔍 Best Practices

1. **One base per API**: Create one `createRestBase` instance per base URL
2. **Organize by domain**: Group related endpoints in the same file
3. **Export immediately**: Destructure and export hooks right when you create them
4. **Avoid duplicates**: Use unique endpoint names across all files
5. **Centralize config**: Keep shared config in `base.ts`

## 📚 Related Documentation

- [Multiple Endpoints Guide](../../MULTIPLE_ENDPOINTS_GUIDE.md) - Complete guide with more examples
- [Main README](../../README.md) - Full library documentation
- [CHANGELOG](../../CHANGELOG.md) - Version history and breaking changes
