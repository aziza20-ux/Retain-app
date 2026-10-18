import { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseList    from '../components/expenses/ExpenseList';
import ExpenseDetails from '../components/expenses/ExpenseDetails';
import ExpenseForm, { type ExpenseFormData } from '../components/expenses/ExpenseForm';
import { useAppData } from '../context/AppDataContext';
import { useAuth }    from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setPage } from '../redux/expenseFilterSlice';
import type { Expense } from '../types';

const PAGE_SIZE = 10;

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, categories } = useAppData();
  const { user }    = useAuth();
  const dispatch    = useAppDispatch();
  const filters     = useAppSelector(s => s.expenseFilter);
  const userId      = user?.id ?? '';

  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Expense | null>(null);
  const [detailExp, setDetailExp] = useState<Expense | null>(null);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');
  const [toast,     setToast]     = useState('');
  const dismissToast = useCallback(() => setToast(''), []);

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

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(filters.page, totalPages);
  const pageStart  = (safePage - 1) * PAGE_SIZE;
  const paginated  = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setShowForm(true);
  };

  const handleSave = async (data: ExpenseFormData) => {
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateExpense(editing.id, data);
        setToast('Expense updated successfully.');
      } else {
        await addExpense(data);
        setToast('Expense created successfully.');
      }
      setShowForm(false);
      setEditing(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormError('');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpense(deleteId);
      setToast('Expense deleted successfully.');
    } catch { /* ignore */ }
    setDeleteId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-12 md:pt-0">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-[#DEE2E6] bg-white flex flex-wrap items-center justify-between gap-3">
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
            expenses={paginated}
            categories={categories}
            onView={setDetailExp}
            onEdit={openEdit}
            onDelete={setDeleteId}
          />
          {/* Pagination controls */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3 gap-2">
              <p className="text-sm text-[#6C757D]">
                Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch(setPage(1))}
                  disabled={safePage === 1}
                  className="px-2 py-1 text-sm rounded-lg border border-[#DEE2E6] text-[#6C757D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  onClick={() => dispatch(setPage(safePage - 1))}
                  disabled={safePage === 1}
                  className="px-2 py-1 text-sm rounded-lg border border-[#DEE2E6] text-[#6C757D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-[#6C757D]">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => dispatch(setPage(item))}
                        className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                          item === safePage
                            ? 'bg-[#0B2545] text-white border-[#0B2545]'
                            : 'border-[#DEE2E6] text-[#6C757D] hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )
                }
                <button
                  onClick={() => dispatch(setPage(safePage + 1))}
                  disabled={safePage === totalPages}
                  className="px-2 py-1 text-sm rounded-lg border border-[#DEE2E6] text-[#6C757D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  ›
                </button>
                <button
                  onClick={() => dispatch(setPage(totalPages))}
                  disabled={safePage === totalPages}
                  className="px-2 py-1 text-sm rounded-lg border border-[#DEE2E6] text-[#6C757D] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}
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
          saving={saving}
          error={formError}
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

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  );
}
