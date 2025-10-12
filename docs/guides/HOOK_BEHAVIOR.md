# Hook Execution Behavior

## ❓ Question: Do all endpoints run when I call createEndpoints?

**Short Answer: NO** ✅

Only the hooks you **actually use in your component** will execute. Other hooks remain dormant.

## 🔍 How It Works

### Scenario 1: Single Hook Usage (Correct - Most Efficient)

```typescript
// api/todos.ts
export const { useGetTodos, useCreateTodo, useDeleteTodo } = api.createEndpoints((builder) => ({
  getTodos: builder({ url: '/todos', params: { method: 'GET' } }),
  createTodo: builder({ url: '/todos', params: { method: 'POST' } }),
  deleteTodo: builder({ url: '/todos', params: { method: 'DELETE' } }),
}));

// components/TodoList.tsx
import { useGetTodos } from '../api/todos';

function TodoList() {
  const [getTodos, todosState] = useGetTodos(); // ✅ Only this hook runs
  
  useEffect(() => {
    getTodos(); // ✅ Only /todos GET is called
  }, [getTodos]);
  
  return <div>{/* ... */}</div>;
}
```

**Result**: Only `useGetTodos` is initialized. `useCreateTodo` and `useDeleteTodo` are NOT called.

---

### Scenario 2: Multiple Hooks Usage (Also Correct)

```typescript
// components/TodoList.tsx
import { useGetTodos, useCreateTodo, useDeleteTodo } from '../api/todos';

function TodoList() {
  const [getTodos, todosState] = useGetTodos();       // ✅ This hook runs
  const [createTodo, createState] = useCreateTodo();  // ✅ This hook runs
  const [deleteTodo, deleteState] = useDeleteTodo();  // ✅ This hook runs
  
  // Each hook is independent and only makes requests when YOU call its trigger
  
  return <div>{/* ... */}</div>;
}
```

**Result**: All three hooks are initialized in your component, but **no API requests are made** until you call their trigger functions (`getTodos()`, `createTodo()`, etc.).

---

### Scenario 3: Trigger Functions Control Requests

```typescript
function TodoList() {
  const [getTodos, todosState] = useGetTodos();
  const [createTodo, createState] = useCreateTodo();
  
  useEffect(() => {
    getTodos(); // ✅ Only this makes an API call to GET /todos
  }, [getTodos]);
  
  const handleCreate = () => {
    createTodo({ title: 'New' }); // ✅ Only this makes an API call to POST /todos
  };
  
  return <button onClick={handleCreate}>Create</button>;
}
```

**Result**: 
- `getTodos()` makes a GET request to `/todos`
- `createTodo()` makes a POST request to `/todos` when the button is clicked
- Each trigger is independent

---

## 🐛 If You're Seeing Logs for All Endpoints

### ✅ FIXED in v0.0.56+

**The console logging issue has been fixed!** A debug `console.log` statement in the `useStore` hook was causing console spam for every hook used in components. This has been removed.

If you're on an older version (v0.0.55 or earlier), upgrade to v0.0.56+ to fix this issue:

```bash
npm install rest-api-kit@latest
# or
yarn upgrade rest-api-kit
```

### Previous Issue (v0.0.55 and earlier)

If you're seeing logs for ALL endpoints even when you only use one hook, this could be caused by:

### 1. **Component Re-renders**
```typescript
// ❌ BAD: This re-creates hooks on every render
function TodoList() {
  const api = createRestBase({ baseUrl: '...' }); // ❌ Don't do this in component!
  const { useGetTodos } = api.createEndpoints(...); // ❌ Don't do this in component!
  const [getTodos, todosState] = useGetTodos();
  // ...
}

// ✅ GOOD: Create API outside component
const api = createRestBase({ baseUrl: '...' });
export const { useGetTodos } = api.createEndpoints(...);

function TodoList() {
  const [getTodos, todosState] = useGetTodos(); // ✅ Correct
  // ...
}
```

### 2. **Destructuring Unused Hooks**
```typescript
// This is fine - React only initializes hooks you actually call
import { useGetTodos, useCreateTodo } from '../api/todos';

function TodoList() {
  // Even though you imported useCreateTodo, if you don't call it here, it won't run
  const [getTodos, todosState] = useGetTodos(); // ✅ Only this runs
  return <div>{/* ... */}</div>;
}
```

### 3. **Debug Logging in useRest**

Check if there's logging code in your `useRest` hook or custom middleware:

```typescript
// src/hooks/useRest.ts
export function useRest(...) {
  console.log('Hook initialized'); // ⚠️ This will log for every hook you use
  
  const trigger = async (body) => {
    console.log('Making request to:', url); // ✅ This only logs when trigger is called
    // ...
  };
  
  return [trigger, state];
}
```

---

## ✅ Best Practices

### 1. Create API Configuration Once
```typescript
// ✅ GOOD: api/base.ts (run once at module load)
export const api = createRestBase({ baseUrl: 'https://api.myapp.com' });
```

### 2. Create Endpoints Once
```typescript
// ✅ GOOD: api/todos.ts (run once at module load)
export const { useGetTodos, useCreateTodo } = api.createEndpoints(...);
```

### 3. Use Hooks in Components
```typescript
// ✅ GOOD: components/TodoList.tsx
import { useGetTodos } from '../api/todos';

function TodoList() {
  const [getTodos, todosState] = useGetTodos(); // Initialized once per component instance
  
  useEffect(() => {
    getTodos(); // Makes API request only when called
  }, [getTodos]);
  
  return <div>{/* ... */}</div>;
}
```

### 4. Only Import What You Need
```typescript
// ✅ GOOD: Import only the hooks you'll actually use
import { useGetTodos } from '../api/todos'; // Others won't be initialized

// ⚠️ OK but unnecessary: Import all if you prefer
import { useGetTodos, useCreateTodo, useDeleteTodo } from '../api/todos';
// Only the ones you actually call in your component will be initialized
```

---

## 🔍 Debugging Tips

If you suspect all endpoints are being called:

### 1. Add Logging to Trigger Functions
```typescript
function TodoList() {
  const [getTodos, todosState] = useGetTodos();
  
  useEffect(() => {
    console.log('Calling getTodos'); // Check if this appears in console
    getTodos();
  }, [getTodos]);
}
```

### 2. Check Network Tab
Open browser DevTools → Network tab and see which actual HTTP requests are being made. You should only see requests for endpoints whose trigger functions you called.

### 3. Use React DevTools
Install React DevTools and check which hooks are actually being used by your component.

---

## 📊 Performance Impact

### Hook Initialization (Very Lightweight)
- Creating a hook (e.g., `useGetTodos()`) is very cheap
- It just sets up React state and returns functions
- **NO API request is made** until you call the trigger function

### API Requests (Only When Triggered)
- API requests only happen when you call the trigger function
- Example: `getTodos()`, `createTodo({ title: 'New' })`
- Each trigger is independent and doesn't affect others

---

## 🎯 Summary

| Action | API Request Made? | Hook Initialized? |
|--------|------------------|-------------------|
| Import hook | ❌ No | ❌ No |
| Call hook in component | ❌ No | ✅ Yes (lightweight) |
| Call trigger function | ✅ **YES** | Already initialized |

**Bottom Line**: Only endpoints whose trigger functions you actually call will make API requests. Simply using a hook in your component is very cheap and doesn't make any network requests.

---

## 💡 Still Seeing Issues?

If you're still seeing all endpoints being called when you only trigger one:

1. **Check your code** - Make sure you're not calling multiple trigger functions
2. **Check cache invalidation** - The `updates: ['otherEndpoint']` option might be triggering related endpoints
3. **Check middleware** - Custom middleware might be logging or triggering other endpoints
4. **File an issue** - If it's a bug, please report it with a minimal reproduction

---

**Need more help?** Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) or open an issue on GitHub.
