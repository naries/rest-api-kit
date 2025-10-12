/**
 * Authentication Endpoints
 * 
 * All authentication-related API endpoints:
 * - Login
 * - Signup
 * - Logout
 * - Forgot Password
 * - Reset Password
 */

import { api } from './base';

// Type definitions for auth operations
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface SignupResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  message: string;
}

/**
 * Create authentication endpoints
 * 
 * These hooks will be automatically generated:
 * - useLogin
 * - useSignup
 * - useLogout
 * - useForgotPassword
 * - useResetPassword
 */
export const {
  useLogin,
  useSignup,
  useLogout,
  useForgotPassword,
  useResetPassword,
} = api.createEndpoints((builder) => ({
  
  // POST /auth/login
  login: builder<LoginResponse, LoginRequest>({
    url: '/auth/login',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
    },
  }),

  // POST /auth/signup
  signup: builder<SignupResponse, SignupRequest>({
    url: '/auth/signup',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
    },
  }),

  // POST /auth/logout
  logout: builder<{ success: boolean }, void>({
    url: '/auth/logout',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
    },
  }),

  // POST /auth/forgot-password
  forgotPassword: builder<ForgotPasswordResponse, ForgotPasswordRequest>({
    url: '/auth/forgot-password',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
    },
  }),

  // POST /auth/reset-password
  resetPassword: builder<ResetPasswordResponse, ResetPasswordRequest>({
    url: '/auth/reset-password',
    params: {
      method: 'POST',
      preferCacheValue: false,
      saveToCache: false,
    },
  }),
}));
