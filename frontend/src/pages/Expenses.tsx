import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { mockExpenses, mockCategories, type Expense, type PaymentMethod } from '../data/mockData';

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'OTHER'];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const pmLabel: Record<PaymentMethod, string> = {
  CASH: 'Cash', CARD: 'Card', MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Bank Transfer', OTHER: 'Other',
};

type FormState = {
  title: string; amount: string; date: string;
  paymentMethod: PaymentMethod; categoryId: string; notes: string;
};

const emptyForm = (): FormState => ({
  title: '', amount: '', date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'CASH', categoryId: mockCategories[0].id, notes: '',
});

export default function Expenses() {
  const [expenses, setExpenses]     = useState<Expense[]>(mockExpenses);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Expense | null>(null);
  const [form, setForm]             = useState<FormState>(emptyForm());
  const [formError, setFormError]   = useState('');
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const getCategoryName = (id: string) =>
    mockCategories.find(c => c.id === id)?.name ?? 'Uncategorized';

  const filtered = expenses.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? e.categoryId === filterCat : true;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setForm({
      title: exp.title, amount: String(exp.amount),
      date: exp.date.slice(0, 10), paymentMethod: exp.paymentMethod,
      categoryId: exp.categoryId, notes: exp.notes ?? '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { setFormError('Enter a valid positive amount.'); return; }

    if (editing) {
      setExpenses(prev => prev.map(e =>
        e.id === editing.id
          ? { ...e, title: form.title.trim(), amount: amt, date: new Date(form.date).toISOString(),
              paymentMethod: form.paymentMethod, categoryId: form.categoryId, notes: form.notes.trim() }
          : e
      ));
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`, title: form.title.trim(), amount: amt,
        date: new Date(form.date).toISOString(), paymentMethod: form.paymentMethod,
        categoryId: form.categoryId, notes: form.notes.trim(), userId: 'user-1',
        createdAt: new Date().toISOString(),
      };
      setExpenses(prev => [newExp, ...prev]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteId) setExpenses(prev => prev.filter(e => e.id !== deleteId));
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
            <p className="text-sm text-[#6C757D] mt-0.5">{expenses.length} total expenses</p>
          </div>
          <button onClick={openAdd}
            className="px-4 py-2 bg-[#0B2545] text-white text-sm font-medium rounded-lg hover:bg-[#0d2e56] transition-colors">
            + Add Expense
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text" placeholder="Search expenses…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
            />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white">
              <option value="">All Categories</option>
              {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-[#0B2545] font-medium">No expenses found</p>
              <p className="text-sm text-[#6C757D] mt-1">Try adjusting your search or add a new expense.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DEE2E6] text-left">
                      <th className="px-4 py-3 font-semibold text-[#6C757D]">Title</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D]">Category</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D]">Date</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D]">Method</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D] text-right">Amount</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(exp => (
                      <tr key={exp.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-[#0B2545]">{exp.title}</td>
                        <td className="px-4 py-3 text-[#6C757D]">{getCategoryName(exp.categoryId)}</td>
                        <td className="px-4 py-3 text-[#6C757D]">{formatDate(exp.date)}</td>
                        <td className="px-4 py-3 text-[#6C757D]">{pmLabel[exp.paymentMethod]}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#DC3545]">
                          -${exp.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => openEdit(exp)}
                            className="text-[#0B2545] hover:underline text-xs mr-3">Edit</button>
                          <button onClick={() => setDeleteId(exp.id)}
                            className="text-[#DC3545] hover:underline text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[#0B2545] mb-4">
              {editing ? 'Edit Expense' : 'Add Expense'}
            </h2>
            {formError && (
              <div className="mb-3 px-3 py-2 bg-red-50 text-[#DC3545] text-sm rounded-lg">{formError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0B2545] mb-1">Amount ($)</label>
                  <input type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0B2545] mb-1">Date</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white">
                  {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white">
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{pmLabel[m]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors">
                {editing ? 'Save Changes' : 'Add Expense'}
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
            <h2 className="text-lg font-bold text-[#0B2545] mb-1">Delete Expense?</h2>
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
