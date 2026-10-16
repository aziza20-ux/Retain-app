import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react';
import type { User, Role } from '../types';
import { authApi, tokenStore, userRole } from '../api/auth.api';
import { getErrorMessage } from '../api/axios';

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;           // true while restoring session on first load
  login:    (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout:   () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage token on first mount.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) { setIsLoading(false); return; }

    authApi.getMe()
      .then(res => setUser(res.data.user))
      .catch(() => { tokenStore.clear(); setUser(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await authApi.login(email, password);
      tokenStore.save(res.data.token);
      setUser(res.data.user);
      return null;
    } catch (err) {
      return getErrorMessage(err);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      await authApi.register(name, email, password);
      return null;
    } catch (err) {
      return getErrorMessage(err);
    }
  };

  const logout = async (): Promise<void> => {
    try { await authApi.logout(); } catch { /* ignore network errors on logout */ }
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: userRole(user),
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
