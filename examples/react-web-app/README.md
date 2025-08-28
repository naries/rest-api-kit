# React Web App Integration Example

A complete example showing how to integrate Rest API Kit into a React web application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install rest-api-kit react react-dom @types/react @types/react-dom
```

### 2. Create API Configuration

```typescript
// src/api/base.ts
import { createRestBase } from 'rest-api-kit';

export const api = createRestBase({
  baseUrl: process.env.REACT_APP_API_URL || 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    // Add authentication token
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Set default headers
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    return headers;
  },
});
```

### 3. Define Your Endpoints

```typescript
// src/api/endpoints.ts
import { api } from './base';

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

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

// Create typed endpoints
export const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useGetUser,
} = api.createEndpoints((builder) => ({
  
  // GET all todos
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),

  // POST create todo
  createTodo: builder<Todo, CreateTodoRequest>({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear todos cache after creation
    },
  }),

  // PUT update todo
  updateTodo: builder<Todo, { id: number; title?: string; completed?: boolean }>({
    url: '/todos',
    params: {
      method: 'PUT',
      updates: ['getTodos'],
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.id}`,
    },
  }),

  // DELETE todo
  deleteTodo: builder<{ success: boolean }, { id: number }>({
    url: '/todos',
    params: {
      method: 'DELETE',
      updates: ['getTodos'],
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.id}`,
    },
  }),

  // GET user
  getUser: builder<User, { userId: number }>({
    url: '/users',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      buildUrl: (baseUrl, body) => `${baseUrl}/${body.userId}`,
    },
  }),
}));
```

### 4. Create Components

```typescript
// src/components/TodoList.tsx
import React, { useEffect, useState } from 'react';
import { useGetTodos, useCreateTodo, useUpdateTodo, useDeleteTodo } from '../api/endpoints';

const TodoList: React.FC = () => {
  const [getTodos, { data: todos, loading, error }] = useGetTodos();
  const [createTodo, createState] = useCreateTodo();
  const [updateTodo, updateState] = useUpdateTodo();
  const [deleteTodo, deleteState] = useDeleteTodo();
  
  const [newTodoTitle, setNewTodoTitle] = useState('');

  // Load todos on component mount
  useEffect(() => {
    getTodos();
  }, []);

  const handleCreateTodo = async () => {
    if (!newTodoTitle.trim()) return;
    
    const result = await createTodo({
      title: newTodoTitle,
      completed: false,
      userId: 1,
    });
    
    if (result.type === 'success') {
      setNewTodoTitle('');
      // Refresh todos list
      getTodos();
    }
  };

  const handleToggleTodo = async (todo: any) => {
    const result = await updateTodo({
      id: todo.id,
      completed: !todo.completed,
    });
    
    if (result.type === 'success') {
      // Refresh todos list
      getTodos();
    }
  };

  const handleDeleteTodo = async (id: number) => {
    const result = await deleteTodo({ id });
    
    if (result.type === 'success') {
      // Refresh todos list
      getTodos();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Todo List</h1>
      
      {/* Add new todo */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Enter new todo..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleCreateTodo()}
        />
        <button
          onClick={handleCreateTodo}
          disabled={createState.loading || !newTodoTitle.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createState.loading ? 'Adding...' : 'Add Todo'}
        </button>
      </div>

      {/* Todo list */}
      <div className="space-y-2">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo)}
              disabled={updateState.loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            
            <span
              className={`flex-1 ${
                todo.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              }`}
            >
              {todo.title}
            </span>
            
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              disabled={deleteState.loading}
              className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            >
              {deleteState.loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      {todos?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No todos yet. Add one above to get started!
        </div>
      )}
    </div>
  );
};

export default TodoList;
```

### 5. Main App Component

```typescript
// src/App.tsx
import React from 'react';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Rest API Kit Demo
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <TodoList />
      </main>
    </div>
  );
}

export default App;
```

### 6. Environment Configuration

```bash
# .env
REACT_APP_API_URL=https://jsonplaceholder.typicode.com
```

## 🎯 Key Features Demonstrated

### ✅ Type Safety
- Full TypeScript support with intelligent autocomplete
- Type-safe request and response handling
- Compile-time error checking

### ✅ Caching Strategy
- Automatic caching for GET requests
- Cache invalidation after mutations
- Performance optimization with cache reuse

### ✅ Error Handling
- Comprehensive error states
- User-friendly error messages
- Graceful degradation

### ✅ Loading States
- Loading indicators for all operations
- Disabled states during operations
- Optimistic UI updates

### ✅ Real-world Patterns
- CRUD operations (Create, Read, Update, Delete)
- Form handling and validation
- State management without Redux

## 🚀 Running the Example

1. **Clone and Setup**
   ```bash
   git clone [your-repo]
   cd rest-api-kit/examples/react-web-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## 📱 What You'll See

- A clean, responsive todo list interface
- Real-time loading states and error handling
- Smooth interactions with optimistic updates
- Full CRUD functionality with a real API

## 🎨 Styling

This example uses Tailwind CSS for styling, but Rest API Kit works with any CSS framework:
- ✅ Tailwind CSS
- ✅ Material-UI
- ✅ Ant Design
- ✅ Chakra UI
- ✅ Styled Components
- ✅ CSS Modules

## 🔄 Next Steps

Once you have this basic example running, try:

1. **Add Authentication**
   - Implement login/logout
   - Token refresh logic
   - Protected routes

2. **Advanced Features**
   - Real-time updates with WebSockets
   - Offline support
   - Background sync

3. **Performance Optimization**
   - Implement pagination
   - Add debounced search
   - Optimize re-renders

4. **Testing**
   - Unit tests for components
   - Integration tests for API calls
   - E2E tests with Cypress

## 📚 Additional Resources

- [Rest API Kit Documentation](../../README.md)
- [TypeScript Integration Guide](../../TYPESCRIPT.md)
- [Performance Best Practices](../../PERFORMANCE.md)
- [Testing Guide](../../TESTING.md)

Happy coding! 🎉
