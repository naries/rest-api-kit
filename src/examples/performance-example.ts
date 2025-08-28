// Example: Performance-Optimized API Setup

import { createRestBase } from 'rest-api-kit';

// ✅ CORRECT: Initialize once at app startup
// File: src/api/index.ts
export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    // This closure is created once and reused
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
}).createEndpoints((builder) => ({
  // All endpoints configured once - memoized for app lifecycle
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),
  
  createTodo: builder<Todo, CreateTodoRequest>({
    url: '/todos',
    params: {
      method: 'POST',
      updates: ['getTodos'], // Invalidates getTodos cache
    },
  }),
}));

// Types for better DX
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

interface CreateTodoRequest {
  title: string;
  completed?: boolean;
  userId: number;
}

// File: src/components/TodoList.tsx
import { api } from '../api';

export function TodoList() {
  // These hooks are memoized - no recreation on re-renders
  const [fetchTodos, todosState] = api.useGetTodos();
  const [createTodo, createState] = api.useCreateTodo();
  
  // Component logic here...
  // Hook functions remain the same reference across renders
}

// File: src/components/AnotherComponent.tsx  
import { api } from '../api';

export function AnotherComponent() {
  // Same memoized hooks - no performance penalty
  const [fetchTodos, state] = api.useGetTodos();
  
  // Multiple components can use the same hooks efficiently
}

// ❌ WRONG: This would recreate everything on every render
function BadExample() {
  // DON'T DO THIS - Creates new API instance every render
  const badApi = createRestBase({...}).createEndpoints(...);
  const [fetchTodos] = badApi.useGetTodos(); // New hook every time!
}

/*
Performance Benefits Demonstrated:

1. Single Initialization:
   - createEndpoints() called once per app lifecycle
   - Console warning if called multiple times
   - Prevents memory leaks and performance degradation

2. Hook Memoization:
   - Hook functions created once and reused
   - Closure captures configuration permanently  
   - No recreation overhead in components

3. Configuration Caching:
   - useRest configurations memoized
   - URL, params, options captured in closures
   - Consistent function references across renders

4. Memory Efficiency:
   - Single hook instance shared across components
   - No duplicate request handlers
   - Predictable memory usage patterns

5. Thread Safety:
   - Initialization guard prevents race conditions
   - Warning system for developer feedback
   - Consistent state across app lifecycle
*/
