import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { mockBudgets, type Budget } from '../data/mockData';

const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const getStatus = (spent: number, amount: number) => {
  const ratio = spent / amount;
  if (ratio >= 1)   return { label: 'Over Budget',   textColor: 'text-[#DC3545]', barColor: 'bg-[#DC3545]', badgeBg: 'bg-red-50 text-[#DC3545]' };
  if (ratio >= 0.8) return { label: 'Approaching',   textColor: 'text-yellow-600', barColor: 'bg-yellow-400', badgeBg: 'bg-yellow-50 text-yellow-700' };
  return              { label: 'Within Budget', textColor: 'text-[#198754]', barColor: 'bg-[#198754]', badgeBg: 'bg-green-50 text-[#198754]' };
};

type FormState = { amount: string; month: string };
const emptyForm = (): FormState => ({ amount: '', month: new Date().toISOString().slice(0, 7) });

export default function Budgets() {
  const [budgets, setBudgets]     = useState<Budget[]>(mockBudgets);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Budget | null>(null);
  const [form, setForm]           = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    setForm({ amount: String(b.amount), month: b.month.slice(0, 7) });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError('');
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { setFormError('Enter a valid positive amount.'); return; }
    if (!form.month) { setFormError('Month is required.'); return; }

    const monthIso = `${form.month}-01T00:00:00.000Z`;

    if (editing) {
      setBudgets(prev => prev.map(b =>
        b.id === editing.id ? { ...b, amount: amt, month: monthIso } : b
      ));
    } else {
      const newBudget: Budget = {
        id: `bud-${Date.now()}`, amount: amt, month: monthIso,
        userId: 'user-1', totalSpent: 0,
      };
      setBudgets(prev => [newBudget, ...prev]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteId) setBudgets(prev => prev.filter(b => b.id !== deleteId));
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
            <p className="text-sm text-[#6C757D] mt-0.5">{budgets.length} monthly budget{budgets.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd}
            className="px-4 py-2 bg-[#0B2545] text-white text-sm font-medium rounded-lg hover:bg-[#0d2e56] transition-colors">
            + Add Budget
          </button>
        </div>

        <div className="px-6 py-6">
          {budgets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-[#0B2545] font-medium">No budgets yet</p>
              <p className="text-sm text-[#6C757D] mt-1">Add a monthly budget to start tracking your spending.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {budgets.map(budget => {
                const status  = getStatus(budget.totalSpent, budget.amount);
                const pct     = Math.min((budget.totalSpent / budget.amount) * 100, 100);
                const remaining = budget.amount - budget.totalSpent;
                return (
                  <div key={budget.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[#0B2545]">{formatMonth(budget.month)}</p>
                        <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${status.badgeBg}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(budget)}
                          className="text-xs text-[#0B2545] hover:underline">Edit</button>
                        <button onClick={() => setDeleteId(budget.id)}
                          className="text-xs text-[#DC3545] hover:underline">Delete</button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#DEE2E6] rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full transition-all ${status.barColor}`} style={{ width: `${pct}%` }} />
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-[#6C757D]">Budget</p>
                        <p className="text-sm font-semibold text-[#0B2545]">${budget.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6C757D]">Spent</p>
                        <p className={`text-sm font-semibold ${status.textColor}`}>${budget.totalSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6C757D]">Remaining</p>
                        <p className={`text-sm font-semibold ${remaining < 0 ? 'text-[#DC3545]' : 'text-[#198754]'}`}>
                          ${Math.abs(remaining).toFixed(2)}{remaining < 0 ? ' over' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
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
                <input type="month" value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Budget Amount ($)</label>
                <input type="number" min="0.01" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 1500"
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors">
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
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2 bg-[#DC3545] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
