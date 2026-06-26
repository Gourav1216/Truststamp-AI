import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl, ensureOk } from '../api';

const AuthContext = createContext(null);
const DEMO_TOKEN_PREFIX = 'demo-token:';
const DEMO_USER_KEY = 'demoUser';

const isMissingBackendError = (message = '') => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('backend api is not connected') ||
    normalized.includes('not_found') ||
    normalized.includes('the page could not be found') ||
    normalized.includes('/api/v1/') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('load failed') ||
    normalized.includes('network error') ||
    normalized.includes('networkerror') ||
    normalized.includes('connection refused')
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    if (authToken?.startsWith(DEMO_TOKEN_PREFIX)) {
      const demoUser = JSON.parse(localStorage.getItem(DEMO_USER_KEY) || 'null');
      setUser(demoUser);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/v1/auth/me'), {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const userData = await ensureOk(response);
        setUser(userData);
        setError(null);
      } else {
        // Token is invalid/expired
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Connection to auth server failed');
    } finally {
      setLoading(false);
    }
  };

  const startDemoSession = (email, fullName = 'TrustStamp Demo User') => {
    const demoUser = {
      id: 'demo-user',
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
      is_active: true
    };
    const demoToken = `${DEMO_TOKEN_PREFIX}${Date.now()}`;
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    localStorage.setItem('token', demoToken);
    setUser(demoUser);
    setToken(demoToken);
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI OAuth2 uses 'username'
      formData.append('password', password);

      const response = await fetch(apiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const { access_token } = await ensureOk(response, 'Login failed. Please verify credentials.');
      localStorage.setItem('token', access_token);
      setToken(access_token);
      return true;
    } catch (err) {
      if (isMissingBackendError(err.message)) {
        startDemoSession(email);
        return true;
      }

      const message = err.message || 'Login failed. Please verify credentials.';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (fullName, email, password) => {
    setError(null);
    try {
      const response = await fetch(apiUrl('/api/v1/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password
        }),
      });

      await ensureOk(response, 'Registration failed.');
      
      // Auto login after successful registration
      await login(email, password);
      return true;
    } catch (err) {
      if (isMissingBackendError(err.message)) {
        startDemoSession(email, fullName);
        return true;
      }

      const message = err.message || 'Registration failed.';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem(DEMO_USER_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isDemoMode: token?.startsWith(DEMO_TOKEN_PREFIX) || false
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
