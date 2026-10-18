import { STATUS_STYLES, formatMonth } from "../../utils/budgetUtils";
import type { BudgetWithCalc } from "../../types";

interface BudgetCardProps {
  budget: BudgetWithCalc;
  onEdit: (budget: BudgetWithCalc) => void;
  onDelete: (id: string) => void;
}

export default function BudgetCard({
  budget,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const s = STATUS_STYLES[budget.status];
  const pct = Math.min(budget.utilisation, 100);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-[#0B2545]">
            {formatMonth(budget.month)}
          </p>
          <span
            className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.badgeBg}`}
          >
            {s.label}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(budget)}
            className="text-xs text-[#0B2545] hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="text-xs text-[#DC3545] hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#DEE2E6] rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full transition-all ${s.barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-[#6C757D] text-right mb-3">
        {budget.utilisation.toFixed(1)}% utilised
      </p>

      {/* Amounts grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-[#6C757D]">Budget</p>
          <p className="text-sm font-semibold text-[#0B2545]">
            ${budget.amount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6C757D]">Spent</p>
          <p className={`text-sm font-semibold ${s.textColor}`}>
            ${budget.totalSpent.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6C757D]">Remaining</p>
          <p
            className={`text-sm font-semibold ${budget.remaining < 0 ? "text-[#DC3545]" : "text-[#198754]"}`}
          >
            ${Math.abs(budget.remaining).toFixed(2)}
            {budget.remaining < 0 ? " over" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
