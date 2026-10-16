import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginRole, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  if (isAuthenticated) return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    const err = login(email.trim(), password);
    if (err) { setError(err); return; }
    navigate(loginRole(email.trim()) === 'ADMIN' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#0B2545] mb-1">Welcome back</h1>
        <p className="text-sm text-[#6C757D] mb-6">Sign in to your Retain account</p>

        <p className="text-xs text-[#6C757D] mb-4 bg-[#F7F8FA] rounded-lg px-3 py-2">
          Demo — user: <strong>alex@example.com</strong> / <strong>password123</strong><br />
          Admin: <strong>admin@retain.app</strong> / <strong>Admin@1234</strong>
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-[#DC3545] text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B2545] mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B2545] mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#6C757D]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#0B2545] font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
