import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextStore';
import api from '../api/axios';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const validateSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (active) {
          const fresh = res.data.data;
          setUser(fresh);
          localStorage.setItem('user', JSON.stringify(fresh));
        }
      } catch {
        if (active) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    validateSession();
    return () => { active = false; };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (!res.data.success) {
      return { success: false, message: res.data.message };
    }
    const { token: t, ...userData } = res.data.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
    return { success: true, user: userData };
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
