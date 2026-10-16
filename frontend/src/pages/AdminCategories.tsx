import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppData } from '../context/AppDataContext';
import { UNCATEGORIZED_ID } from '../data/mockData';
import type { Category } from '../types';

type FormState = { name: string; description: string };
const emptyForm = (): FormState => ({ name: '', description: '' });

export default function AdminCategories() {
  const { categories, expenses, addCategory, updateCategory, deleteCategory } = useAppData();

  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [form,       setForm]       = useState<FormState>(emptyForm());
  const [formError,  setFormError]  = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteId,   setDeleteId]   = useState<string | null>(null);

  const expenseCount = (catId: string) =>
    expenses.filter(e => e.categoryId === catId).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
    setFormError('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError('');
    const trimmedName = form.name.trim();
    if (!trimmedName) { setFormError('Category name is required.'); return; }

    const duplicate = categories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editing?.id,
    );
    if (duplicate) { setFormError('A category with that name already exists.'); return; }

    if (editing) {
      updateCategory({ ...editing, name: trimmedName, description: form.description.trim() });
      setSuccessMsg(`"${trimmedName}" updated successfully.`);
    } else {
      addCategory({ id: `cat-${Date.now()}`, name: trimmedName, description: form.description.trim() });
      setSuccessMsg(`"${trimmedName}" created successfully.`);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const cat = categories.find(c => c.id === deleteId);
    deleteCategory(deleteId);
    setSuccessMsg(`"${cat?.name}" deleted. Affected expenses moved to Uncategorized.`);
    setDeleteId(null);
  };

  const thCls     = 'px-4 py-3 font-semibold text-[#6C757D] text-left';
  const tdCls     = 'px-4 py-3 text-sm text-[#6C757D]';
  const tdBoldCls = 'px-4 py-3 text-sm font-medium text-[#0B2545]';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Page header */}
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

          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 text-[#198754] text-sm border border-green-200">
              {successMsg}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                        {cat.id === UNCATEGORIZED_ID && (
                          <span className="ml-2 text-xs text-[#6C757D] font-normal">(default)</span>
                        )}
                      </td>
                      <td className={tdCls}>{cat.description || '—'}</td>
                      <td className="px-4 py-3 text-center text-[#6C757D]">{expenseCount(cat.id)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-[#0B2545] hover:underline text-xs mr-3"
                        >
                          Edit
                        </button>
                        {cat.id !== UNCATEGORIZED_ID ? (
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
                className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors"
              >
                {editing ? 'Save Changes' : 'Add Category'}
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
