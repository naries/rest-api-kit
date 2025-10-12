/**
 * User Management Endpoints
 * 
 * All user-related API endpoints:
 * - Get user profile
 * - Update user profile
 * - Delete user account
 * - Upload avatar
 * - Get user settings
 * - Update user settings
 */

import { api } from './base';

// Type definitions for user operations
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  username?: string;
  bio?: string;
}

interface UserSettings {
  notifications: boolean;
  emailUpdates: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface UpdateSettingsRequest {
  notifications?: boolean;
  emailUpdates?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

interface UploadAvatarRequest {
  file: File | Blob;
}

interface UploadAvatarResponse {
  avatarUrl: string;
}

/**
 * Create user management endpoints
 * 
 * These hooks will be automatically generated:
 * - useGetUser
 * - useUpdateUser
 * - useDeleteUser
 * - useGetUserProfile
 * - useUploadAvatar
 * - useGetUserSettings
 * - useUpdateUserSettings
 */
export const {
  useGetUser,
  useUpdateUser,
  useDeleteUser,
  useGetUserProfile,
  useUploadAvatar,
  useGetUserSettings,
  useUpdateUserSettings,
} = api.createEndpoints((builder) => ({
  
  // GET /users/:id
  getUser: builder<User, { userId: string }>({
    url: '/users/1', // In a real app, you'd pass userId in the request body
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),

  // PUT /users/:id
  updateUser: builder<User, UpdateUserRequest & { userId: string }>({
    url: '/users/1', // In a real app, you'd pass userId in the request body
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getUser', 'getUserProfile'],
    },
  }),

  // DELETE /users/:id
  deleteUser: builder<{ success: boolean }, { userId: string }>({
    url: '/users/1', // In a real app, you'd pass userId in the request body
    params: {
      method: 'DELETE',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getUser'],
    },
  }),

  // GET /users/profile
  getUserProfile: builder<User, void>({
    url: '/users/1',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),

  // POST /users/avatar
  uploadAvatar: builder<UploadAvatarResponse, UploadAvatarRequest>({
    url: '/users/1/photos',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getUser', 'getUserProfile'],
    },
  }),

  // GET /users/settings
  getUserSettings: builder<UserSettings, void>({
    url: '/users/1',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),

  // PUT /users/settings
  updateUserSettings: builder<UserSettings, UpdateSettingsRequest>({
    url: '/users/1',
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getUserSettings'],
    },
  }),
}));
