import React, { useEffect } from 'react';
import { createRestBase } from 'rest-api-kit';

// Define your data types
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

// Initialize API once at app startup
export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
}).createEndpoints((builder) => ({
  // GET todos - returns Todo[] typed data
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      transformResponse: (data: Todo[]) => {
        // data is properly typed as Todo[]
        return data.slice(0, 10); // Return only first 10
      },
    },
  }),

  // GET single todo - returns Todo typed data
  getTodo: builder<Todo, { id: number }>({
    url: '/todos/:id',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      bodyAsParams: true,
    },
  }),

  // POST new todo - accepts CreateTodoRequest, returns Todo
  createTodo: builder<Todo, CreateTodoRequest>({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear todos cache
      transformResponse: (data: Todo, body?: CreateTodoRequest) => {
        // Both data and body are properly typed
        return {
          ...data,
          localTimestamp: Date.now(),
        };
      },
    },
  }),

  // GET user - returns User typed data  
  getUser: builder<User, { id: number }>({
    url: '/users/:id',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      bodyAsParams: true,
    },
  }),

  // GET endpoint that returns void (no response body expected)
  deleteTodo: builder<void, { id: number }>({
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

// Example React component demonstrating proper typing
export function TodoList() {
  // ✅ data is properly typed as Todo[] | undefined
  const [fetchTodos, { data: todos, isLoading, error }] = api.useGetTodos();
  
  // ✅ trigger accepts CreateTodoRequest type
  const [createTodo, createState] = api.useCreateTodo();
  
  // ✅ deleteTrigger accepts { id: number }
  const [deleteTodo, deleteState] = api.useDeleteTodo();

  useEffect(() => {
    fetchTodos(); // No params needed for void request type
  }, []);

  const handleCreate = () => {
    // ✅ TypeScript enforces correct request shape
    createTodo({
      title: 'New Todo',
      completed: false,
      userId: 1,
    });
    
    // ❌ This would cause TypeScript error:
    // createTodo({ invalidField: 'value' });
  };

  const handleDelete = (todoId: number) => {
    // ✅ TypeScript enforces correct request shape
    deleteTodo({ id: todoId });
    
    // ❌ This would cause TypeScript error:
    // deleteTodo({ todoId }); // Wrong field name
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div>
      <h1>Todo List</h1>
      {todos?.map(todo => ( // ✅ todos is typed as Todo[], so .map is available
        <div key={todo.id}>
          {/* ✅ TypeScript knows todo has id, title, completed properties */}
          <span>{todo.title}</span>
          <input 
            type="checkbox" 
            checked={todo.completed}
            readOnly
          />
          <button onClick={() => handleDelete(todo.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={handleCreate}>Add Todo</button>
      
      {/* Show create state */}
      {createState.isLoading && <div>Creating...</div>}
      {createState.data && (
        <div>
          {/* ✅ createState.data is typed as Todo */}
          Created: {createState.data.title}
        </div>
      )}
    </div>
  );
}

export function TodoDetail({ todoId }: { todoId: number }) {
  // ✅ data is properly typed as Todo | undefined
  const [fetchTodo, { data: todo, isLoading }] = api.useGetTodo();
  
  useEffect(() => {
    // ✅ TypeScript enforces { id: number } shape
    fetchTodo({ id: todoId });
  }, [todoId]);

  if (isLoading) return <div>Loading...</div>;
  if (!todo) return <div>Todo not found</div>;

  return (
    <div>
      {/* ✅ TypeScript knows todo is Todo type with all properties */}
      <h2>{todo.title}</h2>
      <p>ID: {todo.id}</p>
      <p>User ID: {todo.userId}</p>
      <p>Completed: {todo.completed ? 'Yes' : 'No'}</p>
    </div>
  );
}

export function UserProfile({ userId }: { userId: number }) {
  // ✅ data is properly typed as User | undefined
  const [fetchUser, { data: user, isLoading, error }] = api.useGetUser();

  useEffect(() => {
    fetchUser({ id: userId });
  }, [userId]);

  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      {/* ✅ TypeScript knows user is User type */}
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Username: {user.username}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}
