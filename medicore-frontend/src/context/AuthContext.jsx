import { createContext, useContext, useMemo, useState } from 'react';
import { authService, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStore.getUser());

  const value = useMemo(() => {
    const login = async (email, password) => {
      const { data } = await authService.login(email, password);
      const auth = data.data;
      tokenStore.set(auth.token, {
        userId: auth.userId,
        email: auth.email,
        role: auth.role,
      });
      setUser(tokenStore.getUser());
      return auth;
    };

    const register = async (email, password, role) => {
      await authService.register(email, password, role);
    };

    const logout = () => {
      tokenStore.clear();
      setUser(null);
    };

    const refreshMe = async () => {
      const { data } = await authService.me();
      setUser(data.data);
    };

    return { user, login, register, logout, refreshMe };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
