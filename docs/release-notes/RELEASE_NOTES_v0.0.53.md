# v0.0.53 Feature Summary: Multiple Endpoints & Base URLs

## 🎉 What's New

This release removes previous architectural limitations and enables real-world API organization patterns:

### ✅ Multiple `createEndpoints` Calls
You can now call `createEndpoints` multiple times on the same API instance to organize endpoints across separate files.

**Before (v0.0.52 and earlier):**
```typescript
// ❌ Could only call createEndpoints once
const { useLogin, useGetUser, useGetTodos } = api.createEndpoints((builder) => ({
  login: builder({...}),
  getUser: builder({...}),
  getTodos: builder({...}),
  // All 50+ endpoints in one file 😰
}));
```

**Now (v0.0.53+):**
```typescript
// ✅ Organize by feature across multiple files!

// api/auth.ts
export const { useLogin, useSignup } = api.createEndpoints((builder) => ({
  login: builder({...}),
  signup: builder({...}),
}));

// api/users.ts
export const { useGetUser, useUpdateUser } = api.createEndpoints((builder) => ({
  getUser: builder({...}),
  updateUser: builder({...}),
}));

// api/todos.ts
export const { useGetTodos, useCreateTodo } = api.createEndpoints((builder) => ({
  getTodos: builder({...}),
  createTodo: builder({...}),
}));
```

### ✅ Multiple `createRestBase` Instances
You can now create multiple API instances to connect to different services/base URLs.

**Before (v0.0.52 and earlier):**
```typescript
// ❌ Limited to one base URL
const api = createRestBase({ baseUrl: 'https://api.myapp.com' });
// No easy way to connect to multiple services
```

**Now (v0.0.53+):**
```typescript
// ✅ Connect to multiple APIs easily!

// Main application API
const mainApi = createRestBase({ 
  baseUrl: 'https://api.myapp.com' 
});

// Analytics service
const analyticsApi = createRestBase({ 
  baseUrl: 'https://analytics.myapp.com' 
});

// Payment processor
const paymentApi = createRestBase({ 
  baseUrl: 'https://api.stripe.com' 
});

// Each has independent configuration!
```

## 📝 Technical Changes

### Removed Limitations
1. **Singleton Pattern Removed**: `createRestBase` no longer enforces single instance
2. **One-time Initialization Removed**: `createEndpoints` now accumulates instead of replacing
3. **Artificial Restrictions Lifted**: No more "already initialized" errors

### New Behaviors
1. **Endpoint Accumulation**: Each `createEndpoints` call merges new endpoints with existing ones
2. **Hook Accumulation**: All hooks remain available across multiple calls
3. **Duplicate Detection**: Console warnings when duplicate endpoint names are detected
4. **Independent Instances**: Each `createRestBase` instance maintains separate state

### Implementation Details
```typescript
// OLD (v0.0.52): Singleton pattern
let isInitialized = false;
function createEndpoints() {
  if (isInitialized) throw new Error('Already initialized');
  isInitialized = true;
  // ...
}

// NEW (v0.0.53): Accumulative pattern
function createEndpoints() {
  // Merge with existing endpoints
  allEndpoints = { ...allEndpoints, ...newEndpoints };
  allHooks = { ...allHooks, ...newHooks };
  // ...
}
```

## 📚 Documentation Added

### New Guides
1. **[MULTIPLE_ENDPOINTS_GUIDE.md](./MULTIPLE_ENDPOINTS_GUIDE.md)** - Comprehensive guide with examples
2. **[examples/organized-api/](./examples/organized-api/)** - Real-world file organization example
3. **[examples/multiple-apis/](./examples/multiple-apis/)** - Multiple base URLs example

### Updated Documentation
1. **[README.md](./README.md)** - Added feature highlights and links
2. **[CHANGELOG.md](./CHANGELOG.md)** - Documented changes and migration notes
3. **[examples/README.md](./examples/README.md)** - Added new example categories

## 🎯 Use Cases Enabled

### 1. API Organization by Feature
Perfect for medium to large applications:
```
api/
├── auth.ts       # Authentication endpoints
├── users.ts      # User management
├── todos.ts      # Todo CRUD
├── posts.ts      # Blog posts
└── comments.ts   # Comments
```

### 2. Multiple Services Integration
Connect to various APIs in the same app:
```typescript
mainApi      → Your backend
analyticsApi → Google Analytics, Mixpanel
paymentApi   → Stripe, PayPal
cmsApi       → Contentful, WordPress
```

### 3. Microservices Architecture
Each service gets its own configuration:
```typescript
authService    → auth.myapp.com
userService    → users.myapp.com
productService → products.myapp.com
orderService   → orders.myapp.com
```

### 4. Team Collaboration
Developers can work on different API files without conflicts:
- Frontend dev: `api/users.ts`, `api/profile.ts`
- Backend dev: `api/admin.ts`, `api/reports.ts`
- Mobile dev: `api/mobile.ts`, `api/sync.ts`

## ⚠️ Breaking Changes

**None!** This release is fully backward compatible.

Your existing code will continue to work exactly as before:
```typescript
// Still works perfectly!
const api = createRestBase({...});
const { useGetTodos } = api.createEndpoints((builder) => ({
  getTodos: builder({...}),
}));
```

## 🚀 Migration Guide

### No Migration Required
If your current code works, you don't need to change anything.

### Optional: Refactor for Better Organization
If you want to take advantage of the new features:

**Step 1: Split your endpoints file**
```typescript
// Before: api/endpoints.ts (200 lines)
// After:
// api/auth.ts     (30 lines)
// api/users.ts    (40 lines)
// api/todos.ts    (30 lines)
// api/posts.ts    (50 lines)
```

**Step 2: Create index file for convenience**
```typescript
// api/index.ts
export * from './auth';
export * from './users';
export * from './todos';
export * from './posts';
```

**Step 3: Update imports**
```typescript
// Old
import { useLogin, useGetUser, useGetTodos } from './api/endpoints';

// New (specific imports)
import { useLogin } from './api/auth';
import { useGetUser } from './api/users';
import { useGetTodos } from './api/todos';

// Or (centralized import)
import { useLogin, useGetUser, useGetTodos } from './api';
```

## ✨ Benefits

### Developer Experience
- 📁 **Better Organization**: Clear separation of concerns
- 🔍 **Easier Navigation**: Find endpoints by feature
- 🤝 **Team Collaboration**: Reduce merge conflicts
- 📝 **Clearer PRs**: Changes grouped by feature

### Code Quality
- 🧹 **Smaller Files**: Each file has single responsibility
- 🎯 **Focused Modules**: Related endpoints stay together
- 🔄 **Easy Refactoring**: Move endpoints between files easily
- 🧪 **Better Testing**: Test endpoints by feature

### Scalability
- 📈 **Growing Codebases**: Scales with your application
- 🏗️ **Microservices**: Supports distributed architectures
- 🔌 **Third-party APIs**: Easy to add external services
- 🌍 **Multiple Environments**: Different URLs per environment

## 🧪 Testing

All existing tests pass (33/33), plus new tests added:
- ✅ Multiple `createEndpoints` calls accumulate correctly
- ✅ Duplicate endpoint names show warnings
- ✅ Multiple `createRestBase` instances are independent
- ✅ Hooks remain available across calls
- ✅ All existing functionality preserved

## 📦 Package Stats

Build sizes remain unchanged:
- ESM: 34.66 KB (unchanged)
- CJS: 35.97 KB (unchanged)
- DTS: 12.62 KB (unchanged)

## 🔗 Related Links

- [Multiple Endpoints Guide](./MULTIPLE_ENDPOINTS_GUIDE.md)
- [Organized API Example](./examples/organized-api/)
- [Multiple APIs Example](./examples/multiple-apis/)
- [Main Documentation](./README.md)
- [Changelog](./CHANGELOG.md)

---

**Questions or feedback?** Open an issue on GitHub! 🚀
