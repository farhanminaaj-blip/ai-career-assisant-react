import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

const parseJwt = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(encodeURIComponent(payload)));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  return Date.now() < payload.exp * 1000;
};

const getStoredAuth = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  const isAuthenticated = isTokenValid(token);

  if (token && !isAuthenticated) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    isAuthenticated,
    token: isAuthenticated ? token : null,
    refreshToken: refreshToken || null,
    user: isAuthenticated && user ? JSON.parse(user) : null,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth());

  useEffect(() => {
    const handleStorage = () => {
      setAuth(getStoredAuth());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-changed', handleStorage);
    };
  }, []);

  const login = ({ token, refreshToken, user }) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    setAuth({ isAuthenticated: true, token, refreshToken, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAuth({ isAuthenticated: false, token: null, refreshToken: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

