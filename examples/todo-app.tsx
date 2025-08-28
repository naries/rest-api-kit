import React, { useState } from 'react';
import { createRestBase } from 'rest-api-kit';

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

// Create API base
const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Define endpoints with proper typing
const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} = api.createEndpoints((builder) => ({
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
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Invalidate todos cache
    },
  }),
  updateTodo: builder<Todo, { id: number; data: Partial<Todo> }>({
    url: '/todos/{id}',
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'],
    },
  }),
  deleteTodo: builder<void, { id: number }>({
    url: '/todos/{id}',
    params: {
      method: 'DELETE',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'],
    },
  }),
}));

const TodoApp: React.FC = () => {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  
  // API hooks
  const [getTodosTrigger, todosState] = useGetTodos();
  const [createTodoTrigger, createState] = useCreateTodo();
  const [updateTodoTrigger, updateState] = useUpdateTodo();
  const [deleteTodoTrigger, deleteState] = useDeleteTodo();

  // Load todos on mount
  React.useEffect(() => {
    getTodosTrigger();
  }, [getTodosTrigger]);

  const handleCreateTodo = async () => {
    if (newTodoTitle.trim()) {
      try {
        await createTodoTrigger({
          title: newTodoTitle,
          completed: false,
          userId: 1,
        });
        setNewTodoTitle('');
        // Refresh todos after creation
        getTodosTrigger();
      } catch (error) {
        console.error('Failed to create todo:', error);
      }
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await updateTodoTrigger({
        id: todo.id,
        data: { ...todo, completed: !todo.completed },
      });
      // Refresh todos after update
      getTodosTrigger();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodoTrigger({ id });
      // Refresh todos after deletion
      getTodosTrigger();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  if (todosState.isLoading) {
    return <div>Loading todos...</div>;
  }

  if (todosState.error) {
    return <div>Error loading todos</div>;
  }

  return (
    <div>
      <h1>Todo App</h1>
      
      {/* Create new todo */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="Enter todo title"
          onKeyPress={(e) => e.key === 'Enter' && handleCreateTodo()}
        />
        <button 
          onClick={handleCreateTodo}
          disabled={createState.isLoading || !newTodoTitle.trim()}
        >
          {createState.isLoading ? 'Creating...' : 'Add Todo'}
        </button>
      </div>

      {/* Todos list */}
      <div>
        {todosState.data?.slice(0, 10).map((todo) => (
          <div key={todo.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo)}
              disabled={updateState.isLoading}
            />
            <span 
              style={{ 
                marginLeft: '10px',
                textDecoration: todo.completed ? 'line-through' : 'none',
                flex: 1
              }}
            >
              {todo.title}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              disabled={deleteState.isLoading}
              style={{ marginLeft: '10px' }}
            >
              {deleteState.isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      {/* Status indicators */}
      {createState.isLoading && <div>Creating todo...</div>}
      {updateState.isLoading && <div>Updating todo...</div>}
      {deleteState.isLoading && <div>Deleting todo...</div>}
    </div>
  );
};

export default TodoApp;
