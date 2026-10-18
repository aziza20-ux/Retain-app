import { PM_LABEL, formatDate } from "../../utils/budgetUtils";
import type { Category, Expense } from "../../types";

interface ExpenseDetailsProps {
  expense: Expense | null;
  categories: Category[];
  onClose: () => void;
  onEdit: (expense: Expense) => void;
}

export default function ExpenseDetails({
  expense,
  categories,
  onClose,
  onEdit,
}: ExpenseDetailsProps) {
  if (!expense) return null;

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const rows: [string, string][] = [
    ["Title", expense.title],
    ["Amount", `$${expense.amount.toFixed(2)}`],
    ["Date", formatDate(expense.date)],
    ["Category", getCategoryName(expense.categoryId)],
    [
      "Payment Method",
      PM_LABEL[expense.paymentMethod] ?? expense.paymentMethod,
    ],
    ["Notes", expense.notes || "—"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-[#0B2545] mb-4">
          Expense Details
        </h2>
        <dl className="space-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-36 text-[#6C757D] font-medium shrink-0">
                {label}
              </dt>
              <dd className="text-[#0B2545] break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[#DEE2E6] rounded-lg text-sm text-[#6C757D] hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(expense);
            }}
            className="flex-1 py-2 bg-[#0B2545] text-white rounded-lg text-sm font-medium hover:bg-[#0d2e56] transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
