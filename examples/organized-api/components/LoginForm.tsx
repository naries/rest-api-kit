/**
 * Login Form Component
 * 
 * Demonstrates usage of authentication hooks from the organized API structure.
 * Uses the useLogin hook from api/auth.ts
 */

import React, { useState } from 'react';
import { useLogin } from '../api/auth';
import { setAuthToken } from '../api/base';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Get the login trigger function and state
  const [loginTrigger, loginState] = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger the login request
    loginTrigger({ email, password });
  };

  // Handle successful login
  React.useEffect(() => {
    if (loginState.isSuccess && loginState.data) {
      // Save the auth token
      setAuthToken(loginState.data.token);
      
      // Show success message
      console.log('Login successful!', loginState.data.user);
      
      // Redirect or update UI
      // navigate('/dashboard');
    }
  }, [loginState.isSuccess, loginState.data]);

  // Handle login error
  React.useEffect(() => {
    if (loginState.error) {
      console.error('Login failed:', loginState.error);
      alert(`Login failed: ${String(loginState.error)}`);
    }
  }, [loginState.error]);

  return (
    <div className="login-form">
      <h2>Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loginState.isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loginState.isLoading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loginState.isLoading}
        >
          {loginState.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Success message */}
      {loginState.isSuccess && (
        <div className="success-message">
          ✅ Login successful! Welcome back, {loginState.data?.user.name}!
        </div>
      )}

      {/* Error message */}
      {loginState.error && (
        <div className="error-message">
          ❌ {String(loginState.error)}
        </div>
      )}

      {/* Loading indicator */}
      {loginState.isLoading && (
        <div className="loading-indicator">
          🔄 Authenticating...
        </div>
      )}
    </div>
  );
};

export default LoginForm;
