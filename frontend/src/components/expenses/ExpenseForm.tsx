import { useState } from "react";
import { PM_LABEL } from "../../utils/budgetUtils";
import type { Category, Expense, PaymentMethod } from "../../types";

const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "CARD",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "OTHER",
];

type FormState = {
  title: string;
  amount: string;
  date: string;
  paymentMethod: PaymentMethod;
  categoryId: string;
  notes: string;
};

/** Data returned to the parent on a successful save */
export interface ExpenseFormData {
  title: string;
  amount: number;
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  categoryId: string;
  notes?: string;
}

interface ExpenseFormProps {
  /** When provided the form operates in edit mode; otherwise create mode */
  expense: Expense | null;
  categories: Category[];
  onSave: (data: ExpenseFormData) => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string;
}

function buildForm(
  expense: Expense | null,
  defaultCategoryId: string,
): FormState {
  if (expense) {
    return {
      title: expense.title,
      amount: String(expense.amount),
      date: expense.date.slice(0, 10),
      paymentMethod: expense.paymentMethod,
      categoryId: expense.categoryId,
      notes: expense.notes ?? "",
    };
  }
  return {
    title: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "CASH",
    categoryId: defaultCategoryId,
    notes: "",
  };
}

export default function ExpenseForm({
  expense,
  categories,
  onSave,
  onCancel,
  saving,
  error,
}: ExpenseFormProps) {
  const defaultCategoryId = categories[0]?.id ?? "";
  const [form, setForm] = useState<FormState>(() =>
    buildForm(expense, defaultCategoryId),
  );
  const [formError, setFormError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const handleSave = () => {
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Enter a valid positive amount.");
      return;
    }
    if (!form.date) {
      setFormError("Date is required.");
      return;
    }
    if (form.date > today) {
      setFormError("Expense date cannot be in the future.");
      return;
    }
    if (!form.categoryId) {
      setFormError("Category is required.");
      return;
    }

    onSave({
      title: form.title.trim(),
      amount: amt,
      date: new Date(form.date).toISOString(),
      paymentMethod: form.paymentMethod,
      categoryId: form.categoryId,
      notes: form.notes.trim() || undefined,
    });
  };

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label className="block text-xs font-medium text-[#0B2545] mb-1">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    "w-full px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#0B2545] mb-4">
          {expense ? "Edit Expense" : "Add Expense"}
        </h2>

        {(formError || error) && (
          <div className="mb-3 px-3 py-2 bg-red-50 text-[#DC3545] text-sm rounded-lg">
            {formError || error}
          </div>
        )}

        <div className="space-y-3">
          {field(
            "Title",
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className={inputCls}
            />,
          )}

          <div className="grid grid-cols-2 gap-3">
            {field(
              "Amount ($)",
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className={inputCls}
              />,
            )}
            {field(
              "Date",
              <input
                type="date"
                value={form.date}
                max={today}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className={inputCls}
              />,
            )}
          </div>

          {field(
            "Category",
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryId: e.target.value }))
              }
              className={`${inputCls} bg-white`}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>,
          )}

          {field(
            "Payment Method",
            <select
              value={form.paymentMethod}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const val = e.target.value;
                if ((PAYMENT_METHODS as string[]).includes(val)) {
                  setForm((f) => ({ ...f, paymentMethod: val as PaymentMethod }));
                }
              }}
              className={`${inputCls} bg-white`}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PM_LABEL[m]}
                </option>
              ))}
            </select>,
          )}

          {field(
            "Notes (optional)",
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              className={`${inputCls} resize-none`}
            />,
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : expense ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
