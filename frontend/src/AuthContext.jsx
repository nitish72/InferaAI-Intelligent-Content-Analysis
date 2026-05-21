import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('nexusai_token'));
  const [user, setUser] = useState(null);

  // Helper function with timeout to prevent indefinite hanging if server is frozen
  const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Server took too long to respond. If your backend terminal is paused, press Enter to unfreeze it.');
      }
      throw err;
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('nexusai_token', token);
      fetchWithTimeout('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }, 5000)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser({ email: data.email, fullName: data.full_name, createdAt: data.created_at });
        else logout();
      })
      .catch(() => logout());
    } else {
      localStorage.removeItem('nexusai_token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetchWithTimeout('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server error (${res.status}). Ensure backend is running.`);
    }

    if (!res.ok) throw new Error(data.detail || 'Login failed');
    setToken(data.access_token);
    setUser({ email: data.email, fullName: data.full_name, createdAt: data.created_at });
  };

  const signup = async (email, password, full_name) => {
    const res = await fetchWithTimeout('http://localhost:8000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server error (${res.status}). Ensure backend is running.`);
    }

    if (!res.ok) throw new Error(data.detail || 'Signup failed');
    setToken(data.access_token);
    setUser({ email: data.email, fullName: data.full_name, createdAt: data.created_at });
  };

  const logout = () => {
    setToken(null);
  };

  const forgotPassword = async (email) => {
    const res = await fetchWithTimeout('http://localhost:8000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to send reset link');
    return data;
  };

  const resetPassword = async (token, new_password) => {
    const res = await fetchWithTimeout('http://localhost:8000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to reset password');
    return data;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
