import Sidebar from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import { mockExpenses, mockBudgets, mockCategories, mockSummary } from '../data/mockData';

const getBudgetStatus = (spent: number, amount: number) => {
  const ratio = spent / amount;
  if (ratio >= 1)   return { label: 'Over Budget',   color: 'text-[#DC3545]', bar: 'bg-[#DC3545]' };
  if (ratio >= 0.8) return { label: 'Approaching',   color: 'text-yellow-600', bar: 'bg-yellow-400' };
  return              { label: 'Within Budget', color: 'text-[#198754]', bar: 'bg-[#198754]' };
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function Dashboard() {
  const recentExpenses = [...mockExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryName = (id: string) =>
    mockCategories.find(c => c.id === id)?.name ?? 'Uncategorized';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white">
          <h1 className="text-xl font-bold text-[#0B2545]">Overview</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">Your financial summary for July 2025</p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard title="Current Balance" amount={mockSummary.currentBalance} variant="dark" />
            <SummaryCard title="Monthly Income"  amount={mockSummary.monthlyIncome}  variant="income" />
            <SummaryCard title="Monthly Expenses" amount={mockSummary.monthlyExpenses} variant="expense" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-[#0B2545] mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {recentExpenses.map(exp => (
                  <div key={exp.id} className="flex items-center justify-between py-2 border-b border-[#DEE2E6] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#0B2545]">{exp.title}</p>
                      <p className="text-xs text-[#6C757D]">{getCategoryName(exp.categoryId)} · {formatDate(exp.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#DC3545]">
                      -${exp.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-base font-semibold text-[#0B2545] mb-4">Budget Overview</h2>
              <div className="space-y-4">
                {mockBudgets.map(budget => {
                  const status = getBudgetStatus(budget.totalSpent, budget.amount);
                  const pct = Math.min((budget.totalSpent / budget.amount) * 100, 100);
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-[#0B2545]">{formatMonth(budget.month)}</span>
                        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="w-full bg-[#DEE2E6] rounded-full h-2">
                        <div className={`h-2 rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-[#6C757D]">${budget.totalSpent.toFixed(2)} spent</span>
                        <span className="text-xs text-[#6C757D]">${budget.amount.toFixed(2)} budget</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
