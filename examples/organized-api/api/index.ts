/**
 * Centralized API Exports
 * 
 * This file re-exports all hooks from the different API modules.
 * This allows consumers to import all hooks from a single location.
 * 
 * Usage:
 * import { useLogin, useGetTodos, useGetUser } from '@/api';
 * 
 * Or import from specific modules:
 * import { useLogin } from '@/api/auth';
 * import { useGetTodos } from '@/api/todos';
 */

// Re-export auth hooks
export {
  useLogin,
  useSignup,
  useLogout,
  useForgotPassword,
  useResetPassword,
} from './auth';

// Re-export user hooks
export {
  useGetUser,
  useUpdateUser,
  useDeleteUser,
  useGetUserProfile,
  useUploadAvatar,
  useGetUserSettings,
  useUpdateUserSettings,
} from './users';

// Re-export todo hooks
export {
  useGetTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useToggleTodo,
} from './todos';

// Re-export types
export type { Todo } from './todos';

// Re-export utilities
export { api, setAuthToken, clearAuthToken } from './base';
