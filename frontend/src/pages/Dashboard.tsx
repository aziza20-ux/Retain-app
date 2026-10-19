import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import {
  expenseInMonth, STATUS_STYLES,
  formatDate, formatMonth, toMonthKey, monthKeyToIso, formatRWF,
} from '../utils/budgetUtils';

export default function Dashboard() {
  const { expenses, budgets, categories, loading } = useAppData();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  // Default to current month
  const [selectedMonth, setSelectedMonth] = useState<string>(toMonthKey(new Date().toISOString()));
  const monthIso = monthKeyToIso(selectedMonth);

  // Expenses for this user in the selected month
  const monthExpenses = expenses.filter(
    e => e.userId === userId && expenseInMonth(e, monthIso),
  );

  // Budget for this user in the selected month — already a BudgetWithCalc from AppDataContext
  const budget = budgets.find(b => b.userId === userId && toMonthKey(b.month) === selectedMonth) ?? null;

  // Derived metrics
  const totalSpent    = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining     = budget ? budget.remaining : null;
  const highestExp    = monthExpenses.length > 0
    ? monthExpenses.reduce((max, e) => e.amount > max.amount ? e : max)
    : null;

  // Spending by category
  const categoryTotals = categories
    .map(cat => ({
      ...cat,
      total: monthExpenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0),
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // Recent 5 expenses across all months for this user, sorted newest first
  const recentExpenses = [...expenses]
    .filter(e => e.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name ?? 'Uncategorized';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-12 md:pt-0">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#0B2545]">Overview</h1>
            <p className="text-sm text-[#6C757D] mt-0.5">
              Financial summary for {formatMonth(monthIso)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6C757D]">Month</label>
            <input
              type="month" value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white"
            />
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-sm text-[#6C757D]">Loading…</p>
            </div>
          ) : (
          <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard title="Total Spent"       amount={totalSpent}                variant="expense" />
            <SummaryCard title="Remaining Budget"  amount={remaining ?? 0}            variant={remaining !== null && remaining < 0 ? 'expense' : 'income'}
              subtitle={remaining === null ? 'No budget set' : undefined} />
            <SummaryCard title="Highest Expense"   amount={highestExp?.amount ?? 0}   variant="default"
              subtitle={highestExp?.title ?? (monthExpenses.length === 0 ? 'No expenses' : undefined)} />
            <SummaryCard title="Budget Limit"      amount={budget?.amount ?? 0}       variant="dark"
              subtitle={budget ? undefined : 'No budget set'} />
          </div>

          {/* Budget status bar */}
          {budget && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-[#0B2545]">
                  {formatMonth(monthIso)} Budget
                </h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[budget.status].badgeBg}`}>
                  {STATUS_STYLES[budget.status].label}
                </span>
              </div>
              <div className="w-full bg-[#DEE2E6] rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${STATUS_STYLES[budget.status].barColor}`}
                  style={{ width: `${Math.min(budget.utilisation, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#6C757D]">
                <span>{formatRWF(budget.totalSpent)} spent</span>
                <span>{budget.utilisation.toFixed(1)}% of {formatRWF(budget.amount)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-[#0B2545] mb-4">Recent Transactions</h2>
              {recentExpenses.length === 0 ? (
                <p className="text-sm text-[#6C757D] text-center py-6">No expenses yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between py-2 border-b border-[#DEE2E6] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#0B2545]">{exp.title}</p>
                        <p className="text-xs text-[#6C757D]">
                          {getCategoryName(exp.categoryId)} · {formatDate(exp.date)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#DC3545]">
                        -{formatRWF(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Spending by Category */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-[#0B2545] mb-4">Spending by Category</h2>
              {categoryTotals.length === 0 ? (
                <p className="text-sm text-[#6C757D] text-center py-6">No expenses for this month.</p>
              ) : (
                <div className="space-y-3">
                  {categoryTotals.map(cat => {
                    const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                    return (
                      <div key={cat.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-[#0B2545]">{cat.name}</span>
                          <span className="text-[#6C757D]">{formatRWF(cat.total)}</span>
                        </div>
                        <div className="w-full bg-[#DEE2E6] rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-[#0B2545]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  );
}
