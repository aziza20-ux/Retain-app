import axios from 'axios';

// Base URL comes from the Vite environment variable.
// Set VITE_API_BASE_URL=http://localhost:3001/api in frontend/.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error responses into a plain string message.
// Components receive a string, never a raw AxiosError.
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    if (err.message) return err.message;
  }
  return 'An unexpected error occurred.';
}

export default api;
