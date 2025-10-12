/**
 * Todo Management Endpoints
 * 
 * All todo-related API endpoints:
 * - Get all todos
 * - Create new todo
 * - Update existing todo
 * - Delete todo
 * - Toggle todo completion
 */

import { api } from './base';

// Type definitions for todo operations
export interface Todo {
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
  id: number;
  title?: string;
  completed?: boolean;
}

interface DeleteTodoRequest {
  id: number;
}

interface ToggleTodoRequest {
  id: number;
  completed: boolean;
}

/**
 * Create todo management endpoints
 * 
 * These hooks will be automatically generated:
 * - useGetTodos
 * - useCreateTodo
 * - useUpdateTodo
 * - useDeleteTodo
 * - useToggleTodo
 */
export const {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodo,
} = api.createEndpoints((builder) => ({
  
  // GET /todos
  getTodos: builder<Todo[], void>({
    url: '/todos',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),

  // POST /todos
  createTodo: builder<Todo, CreateTodoRequest>({
    url: '/todos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear getTodos cache after creation
      transformResponse: (data, requestBody) => {
        // Add any client-side metadata
        return { ...data, locallyCreated: true };
      },
    },
  }),

  // PUT /todos/:id
  updateTodo: builder<Todo, UpdateTodoRequest>({
    url: '/todos/1', // In a real app, you'd dynamically construct this
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear getTodos cache after update
    },
  }),

  // DELETE /todos/:id
  deleteTodo: builder<{ success: boolean }, DeleteTodoRequest>({
    url: '/todos/1', // In a real app, you'd dynamically construct this
    params: {
      method: 'DELETE',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear getTodos cache after deletion
    },
  }),

  // PATCH /todos/:id
  toggleTodo: builder<Todo, ToggleTodoRequest>({
    url: '/todos/1', // In a real app, you'd dynamically construct this
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getTodos'], // Clear getTodos cache after toggle
      transformResponse: (data, requestBody) => {
        // Ensure the completed status matches the request
        return { ...data, completed: requestBody?.completed };
      },
    },
  }),
}));
