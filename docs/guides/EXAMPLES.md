# Updated API Usage Examples

## ⚠️ CRITICAL: Initialize Once Pattern

**IMPORTANT**: The API should be initialized **ONCE** at the top level of your application, not inside components or functions. This prevents performance issues and hook recreation.

```typescript
import { createRestBase } from 'rest-api-kit';

// ✅ CORRECT: Initialize at app startup (e.g., in api.ts or services/api.ts)
export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
}).createEndpoints((builder) => ({
  // All your endpoints defined once here
  getTodos: builder<
    Array<{ id: number; title: string; completed: boolean; userId: number }>,
    void
  >({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      successCondition: (data) => Array.isArray(data) && data.length > 0,
      transformResponse: (data) => data.slice(0, 10), // Only show first 10
    },
  }),

  getTodo: builder<
    { id: number; title: string; completed: boolean; userId: number },
    { id: number }
  >({
    url: '/todos/:id',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      bodyAsParams: true, // Send as URL params for GET
    },
  }),

  createTodo: builder<
    { id: number; title: string; completed: boolean; userId: number },
    { title: string; completed?: boolean; userId: number }
  >({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear todos list cache
      successCondition: (data) => data && typeof data.id === 'number',
      transformResponse: (data, body) => ({
        ...data,
        localTimestamp: Date.now(),
      }),
    },
  }),

  updateTodo: builder<
    { id: number; title: string; completed: boolean; userId: number },
    { id: number; title?: string; completed?: boolean }
  >({
    url: '/todos/:id',
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: true,
      updates: ['getTodos', 'getTodo'], // Clear both list and single item cache
    },
  }),

  deleteTodo: builder<
    {},
    { id: number }
  >({
    url: '/todos/:id',
    params: {
      method: 'DELETE',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos', 'getTodo'],
      bodyAsParams: true,
    },
  }),
}));

// ❌ WRONG: Don't do this inside components or functions
function SomeComponent() {
  // This will recreate the API on every render - BAD!
  const api = createRestBase({...}).createEndpoints(...);
  // ...
}
```

## Component Usage

```typescript
// ✅ CORRECT: Import the pre-initialized API
import { api } from './api'; // Your centralized API file

function TodoList() {
  // Hooks are directly available and memoized
  const [fetchTodos, { data: todos, isLoading, error }] = api.useGetTodos();
  const [createTodo, createState] = api.useCreateTodo();
  const [deleteTodo, deleteState] = api.useDeleteTodo();

  useEffect(() => {
    fetchTodos(); // Fetch todos on mount
  }, []);

  const handleCreate = (title: string) => {
    createTodo({
      title,
      completed: false,
      userId: 1,
    });
  };

  const handleDelete = (id: number) => {
    deleteTodo({ id });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div>
      <h1>Todo List</h1>
      {todos?.map(todo => (
        <div key={todo.id}>
          <span>{todo.title}</span>
          <button onClick={() => handleDelete(todo.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={() => handleCreate('New Todo')}>
        Add Todo
      </button>
    </div>
  );
}

function TodoDetail({ todoId }: { todoId: number }) {
  const [fetchTodo, { data: todo, isLoading }] = api.useGetTodo();
  const [updateTodo, updateState] = api.useUpdateTodo();

  useEffect(() => {
    fetchTodo({ id: todoId });
  }, [todoId]);

  const handleToggle = () => {
    if (todo) {
      updateTodo({
        id: todo.id,
        completed: !todo.completed,
      });
    }
  };

  if (isLoading) return <div>Loading todo...</div>;
  if (!todo) return <div>Todo not found</div>;

  return (
    <div>
      <h2>{todo.title}</h2>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
        />
        Completed
      </label>
    </div>
  );
}
```

## Project Structure Recommendation

```
src/
  api/
    index.ts        # Your main API configuration
    types.ts        # API-specific types
  components/
    TodoList.tsx    # Uses api.useGetTodos()
    TodoDetail.tsx  # Uses api.useGetTodo()
  App.tsx           # Main app component
```

**api/index.ts:**
```typescript
import { createRestBase } from 'rest-api-kit';
import { TodoResponse, CreateTodoRequest } from './types';

export const api = createRestBase({
  baseUrl: process.env.REACT_APP_API_URL || 'https://api.example.com',
  prepareHeaders: (headers) => {
    // Global headers setup
    return headers;
  },
}).createEndpoints((builder) => ({
  // All endpoints defined once here
}));
```

## Performance Benefits

1. **No Hook Recreation**: Hooks are created once and memoized
2. **Single Initialization**: `createEndpoints` warns if called multiple times
3. **Closure Optimization**: Hook configurations are captured in closures
4. **Memory Efficiency**: No duplicate hook instances across components
5. **Thread Safety**: Prevents race conditions from multiple initializations

## Key Improvements

- **One-time initialization** prevents performance bottlenecks
- **Memoized hook configurations** avoid recreation overhead  
- **Warning system** alerts developers to multiple initialization attempts
- **Closure-based memoization** ensures optimal memory usage
- **Type safety** preserved throughout the optimization
