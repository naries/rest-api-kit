# 🚀 Rest API Kit

<div align="center">

![Rest API Kit](https://img.shields.io/badge/Rest%20API%20Kit-v0.0.53-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-Compatible-61DAFB?style=for-the-badge&logo=react)
![React Native](https://img.shields.io/badge/React%20Native-Compatible-61DAFB?style=for-the-badge&logo=react)

**The ultimate TypeScript-first REST API management library for React and React Native applications**

*Take complete control of your API calls, caching, and state management with enterprise-grade features and developer-friendly APIs.*

</div>

## ✨ Why Rest API Kit?

- 🎯 **Zero Configuration** - Works out of the box with sensible defaults
- 🔥 **Type-Safe** - Full TypeScript support with intelligent type inference
- ⚡ **Performance First** - Advanced caching, memoization, and selective updates
- 🏗️ **Enterprise Ready** - Middleware, interceptors, retry logic, and error handling
- 📱 **Universal** - Works seamlessly in React web apps and React Native mobile apps
- 🧩 **Modular** - Use only what you need, tree-shakeable
- 🛠️ **Developer Experience** - Redux DevTools, debugging, and comprehensive error messages

---

## 📦 Installation

```bash
# npm
npm install rest-api-kit

# yarn
yarn add rest-api-kit

# pnpm
pnpm add rest-api-kit
```

### Peer Dependencies
```bash
npm install react@^17.0.0 || ^18.0.0
```

---

## 🚀 Quick Start

### 1. Create Your API Base

```typescript
// api/base.ts
import { createRestBase } from 'rest-api-kit';

export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    // Add authentication, content-type, etc.
    const token = localStorage.getItem('authToken'); // or from your auth system
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});
```

### 2. Define Your Endpoints

```typescript
// api/endpoints.ts
import { api } from './base';

// Define your API endpoints with full type safety
export const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useGetUser,
} = api.createEndpoints((builder) => ({
  
  // GET endpoint with response typing
  getTodos: builder<
    Todo[], // Response type
    void    // Request body type (void for GET)
  >({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,  // Use cache if available
      saveToCache: true,       // Save response to cache
    },
  }),

  // POST endpoint with request/response typing
  createTodo: builder<
    Todo,                    // Response type
    CreateTodoRequest       // Request body type
  >({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'],  // Clear getTodos cache after creation
      transformResponse: (data, requestBody) => {
        // Transform response data
        return { ...data, locallyCreated: true };
      },
    },
  }),

  // PUT endpoint
  updateTodo: builder<
    Todo,
    UpdateTodoRequest & { id: string }
  >({
    url: '/todos',
    params: {
      method: 'PUT',
      updates: ['getTodos'],
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.id}`,
    },
  }),

  // DELETE endpoint
  deleteTodo: builder<
    { success: boolean },
    { id: string }
  >({
    url: '/todos',
    params: {
      method: 'DELETE',
      updates: ['getTodos'],
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.id}`,
    },
  }),

  // GET with parameters
  getUser: builder<
    User,
    { userId: string }
  >({
    url: '/users',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.userId}`,
    },
  }),
}));

// Type definitions
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

interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}
```

### 3. Use in Your Components

```typescript
// components/TodoList.tsx
import React, { useEffect } from 'react';
import { useGetTodos, useCreateTodo, useDeleteTodo } from '../api/endpoints';

const TodoList: React.FC = () => {
  // Destructure trigger function and state
  const [getTodos, { data: todos, loading, error }] = useGetTodos();
  const [createTodo, createState] = useCreateTodo();
  const [deleteTodo, deleteState] = useDeleteTodo();

  // Load todos on component mount
  useEffect(() => {
    getTodos();
  }, []);

  const handleCreateTodo = async () => {
    const result = await createTodo({
      title: 'New Todo',
      completed: false,
      userId: 1,
    });
    
    if (result.type === 'success') {
      console.log('Todo created:', result.data);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const result = await deleteTodo({ id });
    
    if (result.type === 'success') {
      console.log('Todo deleted successfully');
    }
  };

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Todos</h1>
      
      <button onClick={handleCreateTodo} disabled={createState.loading}>
        {createState.loading ? 'Creating...' : 'Add Todo'}
      </button>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <button 
              onClick={() => handleDeleteTodo(todo.id.toString())}
              disabled={deleteState.loading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

---

## 📱 React Native Integration

Rest API Kit works seamlessly with React Native:

```typescript
// api/base.ts (React Native)
import { createRestBase } from 'rest-api-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = createRestBase({
  baseUrl: 'https://your-api.com/v1',
  prepareHeaders: async (headers) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// components/UserProfile.tsx (React Native)
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGetUser } from '../api/endpoints';

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [getUser, { data: user, loading, error }] = useGetUser();

  useEffect(() => {
    getUser({ userId });
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading user...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{user?.name}</Text>
      <Text style={{ fontSize: 16, color: 'gray' }}>{user?.email}</Text>
    </View>
  );
};

export default UserProfile;
```

---

## 🏗️ Advanced Features

### Middleware System

```typescript
import { storeMethods } from 'rest-api-kit';

// Logging middleware
const loggingMiddleware = (action, state, next) => {
  console.log(`[${new Date().toISOString()}] Action:`, action.type);
  const start = Date.now();
  next(action);
  console.log(`[${Date.now() - start}ms] Completed:`, action.type);
};

// Authentication middleware
const authMiddleware = (action, state, next) => {
  if (action.type === 'store/save' && action.payload.id.startsWith('user-')) {
    // Encrypt user data before storing
    const encryptedData = encrypt(action.payload.data);
    next({ ...action, payload: { ...action.payload, data: encryptedData } });
  } else {
    next(action);
  }
};

// Add middleware
storeMethods.addMiddleware(loggingMiddleware);
storeMethods.addMiddleware(authMiddleware);
```

### Request Interceptors

```typescript
import { createRequest, makeRequest } from 'rest-api-kit';

// Custom request with interceptors
const apiClient = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
});

// Request interceptor
apiClient.addRequestInterceptor({
  onRequest: async (config) => {
    // Add timestamp to all requests
    config.headers = config.headers || {};
    config.headers['X-Request-Time'] = Date.now().toString();
    return config;
  },
  onRequestError: async (error) => {
    console.error('Request failed:', error);
    throw error;
  },
});

// Response interceptor
apiClient.addResponseInterceptor({
  onResponse: async (response) => {
    // Log response time
    const requestTime = response.headers.get('X-Request-Time');
    if (requestTime) {
      console.log(`Request took ${Date.now() - parseInt(requestTime)}ms`);
    }
    return response;
  },
  onResponseError: async (error) => {
    if (error.status === 401) {
      // Handle unauthorized
      await refreshToken();
      throw error;
    }
    return error;
  },
});
```

### Optimistic Updates

```typescript
const [updateTodo, { loading, error }] = useUpdateTodo();

const handleToggleTodo = async (todo: Todo) => {
  // Optimistic update
  const optimisticData = { ...todo, completed: !todo.completed };
  
  // Update UI immediately
  updateTodoInCache(todo.id, optimisticData);
  
  try {
    const result = await updateTodo({
      id: todo.id.toString(),
      completed: optimisticData.completed,
    });
    
    if (result.type === 'error') {
      // Revert on error
      updateTodoInCache(todo.id, todo);
    }
  } catch (error) {
    // Revert on error
    updateTodoInCache(todo.id, todo);
  }
};
```

### State Management Integration

```typescript
// Store management
import { useStore, useStoreSelector } from 'rest-api-kit';

const Dashboard: React.FC = () => {
  const store = useStore();
  
  // Selective subscriptions for performance
  const userCount = useStoreSelector(
    state => Object.keys(state).filter(key => key.startsWith('user-')).length
  );
  
  const todoCount = useStoreSelector(
    state => Object.keys(state).filter(key => key.startsWith('todo-')).length
  );

  // Batch operations for efficiency
  const clearAllData = () => {
    store.batch([
      { type: 'store/clear', payload: { id: 'todos' } },
      { type: 'store/clear', payload: { id: 'users' } },
      { type: 'store/clear', payload: { id: 'profile' } },
    ]);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Users: {userCount}</p>
      <p>Todos: {todoCount}</p>
      <button onClick={clearAllData}>Clear All Data</button>
    </div>
  );
};
```

---

## 🎛️ Configuration Options

### Base Configuration

```typescript
const api = createRestBase({
  baseUrl: 'https://api.example.com/v1',
  
  prepareHeaders: (headers) => {
    // Global headers for all requests
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    // Conditional headers
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // API versioning
    headers.set('API-Version', '2023-08-01');
    
    return headers;
  },
});
```

### Endpoint Parameters

```typescript
builder<ResponseType, RequestType>({
  url: '/endpoint',
  params: {
    // HTTP method
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    
    // Caching behavior
    preferCacheValue: true,    // Use cached data if available
    saveToCache: true,         // Save response to cache
    
    // Cache invalidation
    updates: ['endpoint1', 'endpoint2'], // Clear these caches after success
    
    // URL building
    buildUrl: (baseUrl, requestBody) => `${baseUrl}/custom/${requestBody.id}`,
    
    // Data transformation
    transformResponse: (data, requestBody) => {
      // Transform response data
      return { ...data, transformed: true };
    },
    
    // Success condition
    successCondition: (data) => {
      // Custom success validation
      return data.status === 'ok';
    },
    
    // Custom headers for this endpoint
    headers: {
      'X-Custom-Header': 'value',
    },
    
    // Retry configuration
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => error.status >= 500,
    
    // Timeout
    timeout: 30000,
    
    // Request/Response validation
    validateStatus: (status) => status >= 200 && status < 300,
  },
})
```

---

## 🔧 Advanced Use Cases

### File Upload

```typescript
const useUploadFile = builder<
  { url: string; id: string },
  { file: File; metadata?: object }
>({
  url: '/upload',
  params: {
    method: 'POST',
    transformRequest: ({ file, metadata }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      return formData;
    },
  },
});

// Usage
const [uploadFile, { loading, progress }] = useUploadFile();

const handleFileUpload = async (file: File) => {
  const result = await uploadFile({
    file,
    metadata: { userId: 123, category: 'profile' }
  });
};
```

### Pagination

```typescript
const useGetPaginatedTodos = builder<
  { todos: Todo[]; totalCount: number; hasMore: boolean },
  { page: number; limit: number }
>({
  url: '/todos',
  params: {
    method: 'GET',
    buildUrl: (baseUrl, { page, limit }) => 
      `${baseUrl}?page=${page}&limit=${limit}`,
    transformResponse: (data) => ({
      todos: data.items,
      totalCount: data.total,
      hasMore: data.page * data.limit < data.total,
    }),
  },
});

// Infinite scrolling component
const InfiniteTodoList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [getTodos, { data, loading }] = useGetPaginatedTodos();

  const loadMoreTodos = async () => {
    const result = await getTodos({ page, limit: 20 });
    
    if (result.type === 'success') {
      setAllTodos(prev => [...prev, ...result.data.todos]);
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    loadMoreTodos();
  }, []);

  return (
    <div>
      {allTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      
      {data?.hasMore && (
        <button onClick={loadMoreTodos} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
```

### Real-time Updates

```typescript
import { useStoreEvents } from 'rest-api-kit';

const useRealTimeUpdates = () => {
  const [getTodos] = useGetTodos();
  
  useStoreEvents((event) => {
    // Listen for specific store changes
    if (event.type === 'save' && event.payload.id === 'todos') {
      // Todos updated, you might want to notify user
      showNotification('Todos updated!');
    }
  });

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('wss://api.example.com/updates');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'todo_updated') {
        // Refresh todos when server sends update
        getTodos();
      }
    };

    return () => ws.close();
  }, []);
};
```

---

## 🧪 Testing

### Testing Components

```typescript
// __tests__/TodoList.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoList } from '../components/TodoList';

// Mock the API hooks
jest.mock('../api/endpoints', () => ({
  useGetTodos: () => [
    jest.fn(),
    {
      data: [
        { id: 1, title: 'Test Todo', completed: false, userId: 1 }
      ],
      loading: false,
      error: null,
    }
  ],
  useCreateTodo: () => [
    jest.fn().mockResolvedValue({ type: 'success', data: {} }),
    { loading: false, error: null }
  ],
}));

test('renders todos and handles creation', async () => {
  render(<TodoList />);
  
  expect(screen.getByText('Test Todo')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Add Todo'));
  
  await waitFor(() => {
    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });
});
```

### Testing API Integration

```typescript
// __tests__/api.test.ts
import { createRestBase } from 'rest-api-kit';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.enableMocks();
});

afterEach(() => {
  fetchMock.resetMocks();
});

test('API integration', async () => {
  const api = createRestBase({
    baseUrl: 'https://test-api.com',
    prepareHeaders: (headers) => headers,
  });

  const { useGetTodos } = api.createEndpoints((builder) => ({
    getTodos: builder<Todo[], void>({
      url: '/todos',
      params: { method: 'GET' },
    }),
  }));

  fetchMock.mockResponseOnce(
    JSON.stringify([{ id: 1, title: 'Test', completed: false }]),
    { headers: { 'content-type': 'application/json' } }
  );

  // Test the API call
  const [getTodos] = useGetTodos();
  const result = await getTodos();

  expect(result.type).toBe('success');
  expect(result.data).toHaveLength(1);
});
```

---

## 🚀 Performance Optimization

### Bundle Size Optimization

```typescript
// Import only what you need for smaller bundles
import { createRestBase } from 'rest-api-kit';
import { useStore } from 'rest-api-kit/store';
import { createRequest } from 'rest-api-kit/core';
```

### Memory Management

```typescript
// Automatic cleanup
const MyComponent: React.FC = () => {
  const [getTodos, state] = useGetTodos();
  
  // Component automatically cleans up subscriptions on unmount
  // No manual cleanup required!
  
  return <div>{/* component content */}</div>;
};

// Manual cache management for large apps
const clearUnusedCache = () => {
  const store = useStore();
  
  // Clear old data
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const entries = store.entries();
  
  entries.forEach(([key, value]) => {
    if (value.timestamp && value.timestamp < oneHourAgo) {
      store.clear(key);
    }
  });
};
```

---

## 🛠️ Migration Guide

### From Fetch/Axios

```typescript
// ❌ Before (fetch)
const [todos, setTodos] = useState([]);
const [loading, setLoading] = useState(false);

const fetchTodos = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/todos');
    const data = await response.json();
    setTodos(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// ✅ After (Rest API Kit)
const [getTodos, { data: todos, loading, error }] = useGetTodos();

useEffect(() => {
  getTodos();
}, []);
```

### From Redux Toolkit Query

```typescript
// ❌ Before (RTK Query)
const todosApi = createApi({
  reducerPath: 'todosApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getTodos: builder.query<Todo[], void>({
      query: () => 'todos',
    }),
  }),
});

// ✅ After (Rest API Kit)
const { useGetTodos } = api.createEndpoints((builder) => ({
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: { method: 'GET' },
  }),
}));
```

---

## 📚 API Reference

### Core Functions

#### `createRestBase(options)`
Creates the base API instance.

**Parameters:**
- `baseUrl`: string - Base URL for all requests
- `prepareHeaders`: (headers: Headers) => Headers - Global header preparation

#### `builder<ResponseType, RequestType>(config)`
Creates a typed endpoint configuration.

**Type Parameters:**
- `ResponseType`: Type of the API response
- `RequestType`: Type of the request body/parameters

### Hook Returns

```typescript
const [triggerFunction, state] = useEndpoint();
```

**Trigger Function:**
- Returns: `Promise<ApiResponse<ResponseType>>`
- Parameters: RequestType (if not void)

**State Object:**
- `data`: ResponseType | undefined
- `loading`: boolean
- `error`: string | null
- `lastFetched`: number | null

### Store Functions

#### `useStore()`
- `save(id, data, options?)`: Save data to store
- `get(id)`: Retrieve data from store
- `update(id, partialData)`: Update existing data
- `clear(id)`: Remove specific data
- `clearAll()`: Remove all data
- `batch(operations)`: Perform multiple operations

#### `useStoreSelector(selector, equalityFn?)`
Subscribe to specific store data with performance optimization.

#### `useStoreEvents(listener, options?)`
Listen to store events for debugging and logging.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/naries/rest-api-kit.git
cd rest-api-kit
npm install
npm run test
npm run build
```

---

## 📄 License

MIT © [naries](https://github.com/naries)

---

## 🆘 Support

- 📖 [Documentation](https://github.com/naries/rest-api-kit/blob/main/README.md)
- 🐛 [Issue Tracker](https://github.com/naries/rest-api-kit/issues)
- 💬 [Discussions](https://github.com/naries/rest-api-kit/discussions)
- 📧 Email: support@rest-api-kit.dev

---

<div align="center">

**Made with ❤️ by developers, for developers**

[⭐ Star us on GitHub](https://github.com/naries/rest-api-kit) • [📦 NPM Package](https://www.npmjs.com/package/rest-api-kit)

</div>