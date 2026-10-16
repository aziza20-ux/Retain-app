import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import type { ReactNode } from 'react';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Expenses       from './pages/Expenses';
import Budgets        from './pages/Budgets';
import Admin          from './pages/Admin';
import AdminCategories from './pages/AdminCategories';

// Shows nothing while the session is being restored from localStorage.
// Prevents an incorrect redirect to /login on page refresh.
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login"    replace />;
  if (role !== 'ADMIN')  return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/expenses"  element={<ProtectedRoute><Expenses  /></ProtectedRoute>} />
        <Route path="/budgets"   element={<ProtectedRoute><Budgets   /></ProtectedRoute>} />
        <Route path="/admin"             element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/categories"  element={<AdminRoute><AdminCategories /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
