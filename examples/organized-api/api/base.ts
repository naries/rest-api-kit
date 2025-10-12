/**
 * API Base Configuration
 * 
 * This file creates the shared API base that will be used
 * across all endpoint files (auth, users, todos, etc.)
 */

import { createRestBase } from 'rest-api-kit';

/**
 * Main API instance
 * 
 * All endpoint files will use this instance to create their endpoints.
 * This ensures they all share the same base URL and headers configuration.
 */
export const api = createRestBase({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  
  prepareHeaders: (headers) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Set content type
    headers.set('Content-Type', 'application/json');
    
    return headers;
  },
});

/**
 * Helper function to set the auth token
 * Call this after successful login
 */
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

/**
 * Helper function to clear the auth token
 * Call this after logout
 */
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};
