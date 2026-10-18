import api from "./axios";
import type { User, Role } from "../types";

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthUserResponse {
  user: User;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthUserResponse>("/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),

  getMe: () => api.get<AuthUserResponse>("/auth/me"),
};

// Helpers for token persistence in localStorage.
// The token is stored under the key 'token'; the Axios interceptor reads it automatically.
export const tokenStore = {
  save: (token: string) => localStorage.setItem("token", token),
  clear: () => localStorage.removeItem("token"),
  get: () => localStorage.getItem("token"),
};

// Derive the role from a User object — keeps the type in one place.
export function userRole(user: User | null): Role | null {
  return user?.role ?? null;
}
