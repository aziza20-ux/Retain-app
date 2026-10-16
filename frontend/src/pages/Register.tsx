import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const err = await register(name.trim(), email.trim(), password);
    setSubmitting(false);
    if (err) { setError(err); return; }
    setSuccess(true);
    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#0B2545] mb-1">Create account</h1>
        <p className="text-sm text-[#6C757D] mb-6">Start tracking your expenses today</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-[#DC3545] text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[#CFF4FC] text-[#0B2545] text-sm">
            Account created! Redirecting to login…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B2545] mb-1">Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
            />
          </div>
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
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B2545] mb-1">Confirm Password</label>
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#6C757D]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0B2545] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
