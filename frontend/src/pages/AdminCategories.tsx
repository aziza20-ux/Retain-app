import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Toast   from '../components/Toast';
import { useAppData } from '../context/AppDataContext';
import { adminApi } from '../api/admin.api';
import type { Category } from '../types';

type FormState = { name: string; description: string };
const emptyForm = (): FormState => ({ name: '', description: '' });

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory, loading, error } = useAppData();

  const [countMap,   setCountMap]   = useState<Map<string, number>>(new Map());
  const [countLoading, setCountLoading] = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [form,       setForm]       = useState<FormState>(emptyForm());
  const [formError,  setFormError]  = useState('');
  const [toast,      setToast]      = useState('');
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const dismissToast = useCallback(() => setToast(''), []);

  // Fetch platform-wide expense counts per category from admin insights.
  // Re-runs when categories change (e.g. after add/delete) to keep counts fresh.
  useEffect(() => {
    setCountLoading(true);
    adminApi.insights()
      .then(res => {
        const map = new Map<string, number>();
        res.data.spendingByCategory.forEach(c => map.set(c.categoryId, c.expenseCount));
        setCountMap(map);
      })
      .catch(() => {})
      .finally(() => setCountLoading(false));
  }, [categories]);

  const expenseCount = (catId: string) => countMap.get(catId) ?? 0;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description ?? '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError('');
    const trimmedName = form.name.trim();
    if (!trimmedName) { setFormError('Category name is required.'); return; }

    const duplicate = categories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editing?.id,
    );
    if (duplicate) { setFormError('A category with that name already exists.'); return; }

    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, { name: trimmedName, description: form.description.trim() });
        setToast(`"${trimmedName}" updated successfully.`);
      } else {
        await addCategory(trimmedName, form.description.trim() || undefined);
        setToast(`"${trimmedName}" created successfully.`);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const cat = categories.find(c => c.id === deleteId);
    setDeleting(true);
    try {
      await deleteCategory(deleteId);
      setToast(`"${cat?.name}" deleted. Affected expenses moved to Uncategorized.`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
    setDeleteId(null);
  };

  const thCls     = 'px-4 py-3 font-semibold text-[#6C757D] text-left';
  const tdCls     = 'px-4 py-3 text-sm text-[#6C757D]';
  const tdBoldCls = 'px-4 py-3 text-sm font-medium text-[#0B2545]';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-12 md:pt-0">

        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white">
          <h1 className="text-xl font-bold text-[#0B2545]">Manage Categories</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">Create, edit, and delete expense categories</p>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#6C757D]">{categories.length} categories</p>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-[#0B2545] text-white text-sm font-medium rounded-lg hover:bg-[#0d2e56] transition-colors"
            >
              + Add Category
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-[#DC3545] text-sm border border-red-200">
              Failed to load data: {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <p className="px-4 py-6 text-sm text-[#6C757D] text-center">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DEE2E6] text-left">
                      <th className={thCls}>Name</th>
                      <th className={thCls}>Description</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D] text-center">Expenses</th>
                      <th className="px-4 py-3 font-semibold text-[#6C757D] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                        <td className={tdBoldCls}>
                          {cat.name}
                          {cat.name.toLowerCase() === 'uncategorized' && (
                            <span className="ml-2 text-xs text-[#6C757D] font-normal">(default)</span>
                          )}
                        </td>
                        <td className={tdCls}>{cat.description || '—'}</td>
                        <td className="px-4 py-3 text-center text-[#6C757D]">
                          {countLoading ? '…' : expenseCount(cat.id)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openEdit(cat)}
                            className="text-[#0B2545] hover:underline text-xs mr-3"
                          >
                            Edit
                          </button>
                          {cat.name.toLowerCase() !== 'uncategorized' ? (
                            <button
                              onClick={() => setDeleteId(cat.id)}
                              className="text-[#DC3545] hover:underline text-xs"
                            >
                              Delete
                            </button>
                          ) : (
                            <span className="text-xs text-[#DEE2E6]">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[#0B2545] mb-4">
              {editing ? 'Edit Category' : 'Add Category'}
            </h2>
            {formError && (
              <div className="mb-3 px-3 py-2 bg-red-50 text-[#DC3545] text-sm rounded-lg">{formError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0B2545] mb-1">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] resize-none"
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
                disabled={saving}
                className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Category'}
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
            <h2 className="text-lg font-bold text-[#0B2545] mb-1">Delete Category?</h2>
            <p className="text-sm text-[#6C757D] mb-2">
              {expenseCount(deleteId) > 0
                ? `${expenseCount(deleteId)} expense(s) will be reassigned to Uncategorized.`
                : 'This category has no expenses.'}
            </p>
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
                disabled={deleting}
                className="flex-1 py-2 bg-[#DC3545] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  );
}
