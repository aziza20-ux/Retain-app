import { PM_LABEL, formatDate } from "../../utils/budgetUtils";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSortField, setSortDir } from "../../redux/expenseFilterSlice";
import type { Category, Expense, SortField } from "../../types";

interface ExpenseListProps {
  expenses: Expense[]; // already filtered & sorted by the parent
  categories: Category[];
  onView: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({
  expenses,
  categories,
  onView,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const dispatch = useAppDispatch();
  const { sortField, sortDir } = useAppSelector((s) => s.expenseFilter);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      dispatch(setSortDir(sortDir === "asc" ? "desc" : "asc"));
    } else {
      dispatch(setSortField(field));
      dispatch(setSortDir("desc"));
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field)
      return <span className="text-[#DEE2E6] ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">🧾</p>
        <p className="text-[#0B2545] font-medium">No expenses found</p>
        <p className="text-sm text-[#6C757D] mt-1">
          Try adjusting your filters or add a new expense.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DEE2E6] text-left">
              <th className="px-4 py-3 font-semibold text-[#6C757D]">Title</th>
              <th className="px-4 py-3 font-semibold text-[#6C757D]">
                Category
              </th>
              <th className="px-4 py-3 font-semibold text-[#6C757D]">
                <button
                  onClick={() => toggleSort("date")}
                  className="flex items-center hover:text-[#0B2545]"
                >
                  Date{sortIcon("date")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold text-[#6C757D]">Method</th>
              <th className="px-4 py-3 font-semibold text-[#6C757D] text-right">
                <button
                  onClick={() => toggleSort("amount")}
                  className="flex items-center ml-auto hover:text-[#0B2545]"
                >
                  Amount{sortIcon("amount")}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold text-[#6C757D] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr
                key={exp.id}
                className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0B2545]">{exp.title}</p>
                  {exp.notes && (
                    <p className="text-xs text-[#6C757D] mt-0.5 truncate max-w-[180px]">
                      {exp.notes}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-[#6C757D]">
                  {getCategoryName(exp.categoryId)}
                </td>
                <td className="px-4 py-3 text-[#6C757D]">
                  {formatDate(exp.date)}
                </td>
                <td className="px-4 py-3 text-[#6C757D]">
                  {PM_LABEL[exp.paymentMethod] ?? exp.paymentMethod}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#DC3545]">
                  -${exp.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onView(exp)}
                    className="text-[#6C757D] hover:underline text-xs mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(exp)}
                    className="text-[#0B2545] hover:underline text-xs mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(exp.id)}
                    className="text-[#DC3545] hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
