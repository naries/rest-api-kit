import React from 'react';
import { createRestBase } from 'rest-api-kit';

// Example from the README with working configuration
interface User {
  id: number;
  name: string;
  email: string;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

// Create API base
export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Define endpoints with full type safety
export const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useGetUser,
} = api.createEndpoints((builder) => ({
  
  // GET endpoint with response typing
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),

  // POST endpoint with request/response typing
  createTodo: builder<Todo, { title: string; completed?: boolean }>({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Invalidate todos cache
    },
  }),

  // PUT endpoint
  updateTodo: builder<Todo, { id: number; data: Partial<Todo> }>({
    url: '/todos/{id}',
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'],
    },
  }),

  // DELETE endpoint
  deleteTodo: builder<void, { id: number }>({
    url: '/todos/{id}',
    params: {
      method: 'DELETE',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'],
    },
  }),

  // GET user
  getUser: builder<User, { id: number }>({
    url: '/users/{id}',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),
}));

// Example component using the hooks
const ExampleComponent: React.FC = () => {
  const [getTodosTrigger, todosState] = useGetTodos();
  const [createTodoTrigger, createState] = useCreateTodo();
  const [getUserTrigger, userState] = useGetUser();

  React.useEffect(() => {
    // Load todos and user data
    getTodosTrigger();
    getUserTrigger({ id: 1 });
  }, [getTodosTrigger, getUserTrigger]);

  const handleCreateTodo = async () => {
    try {
      await createTodoTrigger({
        title: 'New Todo',
        completed: false,
      });
      // Todos cache will be automatically invalidated
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  return (
    <div>
      <h1>User: {userState.data?.name}</h1>
      
      <button onClick={handleCreateTodo} disabled={createState.isLoading}>
        {createState.isLoading ? 'Creating...' : 'Create Todo'}
      </button>

      <div>
        {todosState.isLoading ? (
          <p>Loading todos...</p>
        ) : todosState.error ? (
          <p>Error loading todos</p>
        ) : (
          <ul>
            {todosState.data?.slice(0, 5).map(todo => (
              <li key={todo.id}>
                {todo.title} - {todo.completed ? 'Done' : 'Pending'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExampleComponent;
