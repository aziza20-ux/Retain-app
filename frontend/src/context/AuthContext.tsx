import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Role } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => string | null;
  loginRole: (email: string) => Role | null; // returns the role for a given email, or null
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Extra users created via register live here alongside the seed users
  const [users, setUsers] = useState<User[]>(mockUsers);

  const login = (email: string, password: string): string | null => {
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return 'Invalid email or password.';
    setUser(found);
    return null;
  };

  const register = (name: string, email: string, password: string): string | null => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return 'An account with that email already exists.';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return null;
  };

  const loginRole = (email: string): Role | null =>
    users.find(u => u.email.toLowerCase() === email.toLowerCase())?.role ?? null;

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, isAuthenticated: user !== null, users, login, loginRole, register, logout }}>
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
