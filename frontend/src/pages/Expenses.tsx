import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseList    from '../components/expenses/ExpenseList';
import ExpenseDetails from '../components/expenses/ExpenseDetails';
import ExpenseForm, { type ExpenseFormData } from '../components/expenses/ExpenseForm';
import { useAppData } from '../context/AppDataContext';
import { useAuth }    from '../context/AuthContext';
import { useAppSelector } from '../redux/hooks';
import type { Expense } from '../types';

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, categories } = useAppData();
  const { user }   = useAuth();
  const filters    = useAppSelector(s => s.expenseFilter);
  const userId     = user?.id ?? '';

  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Expense | null>(null);
  const [detailExp, setDetailExp] = useState<Expense | null>(null);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);

  // ── Filter + sort (driven entirely by Redux state) ────────────────────────
  const userExpenses = expenses.filter(e => e.userId === userId);

  const filtered = userExpenses
    .filter(e => {
      const q = filters.search.toLowerCase();
      if (q && !e.title.toLowerCase().includes(q) && !(e.notes ?? '').toLowerCase().includes(q)) return false;
      if (filters.categoryId    && e.categoryId    !== filters.categoryId)    return false;
      if (filters.paymentMethod && e.paymentMethod !== filters.paymentMethod) return false;
      if (filters.dateFrom && e.date < filters.dateFrom)                      return false;
      if (filters.dateTo   && e.date > filters.dateTo + 'T23:59:59.999Z')    return false;
      return true;
    })
    .sort((a, b) => {
      const dir = filters.sortDir === 'asc' ? 1 : -1;
      if (filters.sortField === 'amount') return (a.amount - b.amount) * dir;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    });

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setShowForm(true);
  };

  const handleSave = (data: ExpenseFormData) => {
    if (editing) {
      updateExpense({ ...editing, ...data });
    } else {
      addExpense({
        id: `exp-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        ...data,
      });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (deleteId) deleteExpense(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0B2545]">Transactions</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">{userExpenses.length} total expenses</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-[#0B2545] text-white text-sm font-medium rounded-lg hover:bg-[#0d2e56] transition-colors"
          >
            + Add Expense
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <ExpenseFilters categories={categories} />
          <ExpenseList
            expenses={filtered}
            categories={categories}
            onView={setDetailExp}
            onEdit={openEdit}
            onDelete={setDeleteId}
          />
        </div>
      </main>

      {/* Detail panel */}
      <ExpenseDetails
        expense={detailExp}
        categories={categories}
        onClose={() => setDetailExp(null)}
        onEdit={openEdit}
      />

      {/* Create / edit form */}
      {showForm && (
        <ExpenseForm
          key={editing?.id ?? 'new'}
          expense={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h2 className="text-lg font-bold text-[#0B2545] mb-1">Delete Expense?</h2>
            <p className="text-sm text-[#6C757D] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-[#DC3545] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
