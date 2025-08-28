import { createRestBase } from 'rest-api-kit';

// Advanced configuration example
const api = createRestBase({
  baseUrl: 'https://api.example.com',
  
  // Custom headers preparation
  prepareHeaders: (headers) => {
    // Add authentication
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  
  // Global transformers
  transformResponse: (data) => {
    // Global response transformation
    if (data && typeof data === 'object' && 'data' in data) {
      // Unwrap common API response format
      return (data as any).data;
    }
    return data;
  },
  
  // Error handling
  transformError: (error) => {
    // Transform error responses
    if (error.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return {
      message: error.message || 'An error occurred',
      status: error.status,
      code: 'UNKNOWN_ERROR',
    };
  },
});

// Define comprehensive endpoints
const {
  useLogin,
  useGetProfile,
  useUpdateProfile,
  useGetPosts,
  useCreatePost,
  useLogout,
} = api.createEndpoints((builder) => ({
  
  // Authentication endpoint
  login: builder<
    { token: string; user: User; expiresIn: number },
    { email: string; password: string }
  >({
    url: '/auth/login',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      transformResponse: (data) => {
        // Store token after successful login
        if ((data as any).token) {
          localStorage.setItem('authToken', (data as any).token);
        }
        return data;
      },
    },
  }),
  
  // User profile with caching
  getProfile: builder<User, void>({
    url: '/user/profile',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
      retryOnFailure: true,
      maxRetries: 3,
    },
  }),
  
  // Update profile
  updateProfile: builder<User, Partial<User>>({
    url: '/user/profile',
    params: {
      method: 'PUT',
      preferCacheValue: false,
      saveToCache: true,
      updates: ['getProfile'], // Clear profile cache
    },
  }),
  
  // Posts with pagination
  getPosts: builder<
    { posts: Post[]; total: number; page: number },
    { page?: number; limit?: number; category?: string }
  >({
    url: '/posts',
    params: {
      method: 'GET',
      preferCacheValue: true,
      saveToCache: true,
    },
  }),
  
  // Create post with cache invalidation
  createPost: builder<Post, { title: string; content: string; category: string }>({
    url: '/posts',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getPosts'], // Invalidate all post caches
    },
  }),
  
  // Logout with cleanup
  logout: builder<void, void>({
    url: '/auth/logout',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
      updates: ['getProfile', 'getPosts'], // Clear all user-specific caches
      transformResponse: () => {
        // Clean up local storage
        localStorage.removeItem('authToken');
        return undefined;
      },
    },
  }),
}));

// Types for the example
interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published';
  authorId: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export {
  useLogin,
  useGetProfile,
  useUpdateProfile,
  useGetPosts,
  useCreatePost,
  useLogout,
};
