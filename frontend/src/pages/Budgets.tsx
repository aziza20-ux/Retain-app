import { useState } from 'react';
import Sidebar    from '../components/Sidebar';
import BudgetCard from '../components/budgets/BudgetCard';
import { useAppData } from '../context/AppDataContext';
import { useAuth }    from '../context/AuthContext';
import { calcBudget, toMonthKey, monthKeyToIso } from '../utils/budgetUtils';
import type { Budget, BudgetWithCalc } from '../types';

type FormState = { amount: string; month: string };
const emptyForm = (): FormState => ({ amount: '', month: toMonthKey(new Date().toISOString()) });

export default function Budgets() {
  const { expenses, budgets, addBudget, updateBudget, deleteBudget } = useAppData();
  const { user }  = useAuth();
  const userId    = user?.id ?? '';

  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<Budget | null>(null);
  const [form,      setForm]      = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [deleteId,  setDeleteId]  = useState<string | null>(null);

  const userBudgets: BudgetWithCalc[] = budgets
    .filter(b => b.userId === userId)
    .map(b => calcBudget(b, expenses));

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (b: BudgetWithCalc) => {
    setEditing(b);
    setForm({ amount: String(b.amount), month: toMonthKey(b.month) });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError('');
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { setFormError('Enter a valid positive amount.'); return; }
    if (!form.month)             { setFormError('Month is required.');             return; }

    const monthIso  = monthKeyToIso(form.month);
    const duplicate = budgets.find(
      b => b.userId === userId && b.month === monthIso && b.id !== editing?.id,
    );
    if (duplicate) { setFormError('A budget for that month already exists.'); return; }

    if (editing) {
      updateBudget({ ...editing, amount: amt, month: monthIso });
    } else {
      addBudget({ id: `bud-${Date.now()}`, amount: amt, month: monthIso, userId });
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteId) deleteBudget(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0B2545]">Budgets</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">
              {userBudgets.length} monthly budget{userBudgets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-[#0B2545] text-white text-sm font-medium rounded-lg hover:bg-[#0d2e56] transition-colors"
          >
            + Add Budget
          </button>
        </div>

        <div className="px-6 py-6">
          {userBudgets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-[#0B2545] font-medium">No budgets yet</p>
              <p className="text-sm text-[#6C757D] mt-1">
                Add a monthly budget to start tracking your spending.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {userBudgets.map(budget => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#0B2545] mb-4">
              {editing ? 'Edit Budget' : 'Add Budget'}
            </h2>
            {formError && (
              <div className="mb-3 px-3 py-2 bg-red-50 text-[#DC3545] text-sm rounded-lg">{formError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Month</label>
                <input
                  type="month" value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Budget Amount ($)</label>
                <input
                  type="number" min="0.01" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors"
              >
                {editing ? 'Save Changes' : 'Add Budget'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h2 className="text-lg font-bold text-[#0B2545] mb-1">Delete Budget?</h2>
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
