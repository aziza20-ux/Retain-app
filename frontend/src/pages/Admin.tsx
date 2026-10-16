import Sidebar     from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import StatCard    from '../components/StatCard';
import { useAppData } from '../context/AppDataContext';
import { useAuth }    from '../context/AuthContext';
import {
  buildCategoryStats,
  countExpensesThisMonth,
  formatDate,
} from '../utils/budgetUtils';

const now = new Date();

const fmtCurrency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export default function Admin() {
  const { categories, expenses } = useAppData();
  const { users } = useAuth();

  // ── Platform-wide metrics ──────────────────────────────────────────────────
  const totalUsers        = users.length;
  const totalExpenseCount = expenses.length;
  const totalExpenseValue = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthCount    = countExpensesThisMonth(expenses, now);

  // ── Category analytics ─────────────────────────────────────────────────────
  const categoryStats      = buildCategoryStats(expenses, categories);
  const spendingByCategory = [...categoryStats].sort((a, b) => b.totalSpent - a.totalSpent);
  const top5    = [...categoryStats]
    .sort((a, b) => b.expenseCount - a.expenseCount || a.name.localeCompare(b.name))
    .slice(0, 5);
  const bottom5 = [...categoryStats]
    .sort((a, b) => a.expenseCount - b.expenseCount || a.name.localeCompare(b.name))
    .slice(0, 5);

  // ── Recent activity ────────────────────────────────────────────────────────
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name ?? 'Uncategorized';
  const getUserName = (userId: string) =>
    users.find(u => u.id === userId)?.name ?? userId;

  // ── Shared table classes ───────────────────────────────────────────────────
  const thCls     = 'px-4 py-3 font-semibold text-[#6C757D] text-left';
  const tdCls     = 'px-4 py-3 text-sm text-[#6C757D]';
  const tdBoldCls = 'px-4 py-3 text-sm font-medium text-[#0B2545]';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Page header */}
        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white">
          <h1 className="text-xl font-bold text-[#0B2545]">Admin Dashboard</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">Platform-wide insights</p>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* 1. Platform overview */}
          <section>
            <h2 className="text-base font-semibold text-[#0B2545] mb-3">Platform Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Registered Users"    value={totalUsers}        variant="dark" />
              <StatCard title="Total Expenses"       value={totalExpenseCount} variant="default" />
              <SummaryCard title="Total Expense Value" amount={totalExpenseValue} variant="expense" />
              <StatCard
                title="Expenses This Month"
                value={thisMonthCount}
                variant="income"
                subtitle={now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              />
            </div>
          </section>

          {/* 2. Category analytics */}
          <section>
            <h2 className="text-base font-semibold text-[#0B2545] mb-3">Category Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Spending per category */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#DEE2E6]">
                  <p className="text-sm font-semibold text-[#0B2545]">Spending by Category</p>
                  <p className="text-xs text-[#6C757D]">Total monetary value per category</p>
                </div>
                {spendingByCategory.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No expense data.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#DEE2E6]">
                          <th className={thCls}>Category</th>
                          <th className="px-4 py-3 font-semibold text-[#6C757D] text-right">Total Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spendingByCategory.map(cat => (
                          <tr key={cat.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                            <td className={tdBoldCls}>{cat.name}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-[#DC3545]">
                              {cat.totalSpent > 0
                                ? fmtCurrency(cat.totalSpent)
                                : <span className="text-[#6C757D] font-normal">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top 5 most-used */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#DEE2E6]">
                  <p className="text-sm font-semibold text-[#0B2545]">Top 5 Most-Used Categories</p>
                  <p className="text-xs text-[#6C757D]">By number of expense records</p>
                </div>
                {top5.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No data.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#DEE2E6]">
                          <th className="px-4 py-3 font-semibold text-[#6C757D] text-center w-10">#</th>
                          <th className={thCls}>Category</th>
                          <th className="px-4 py-3 font-semibold text-[#6C757D] text-right">Expenses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top5.map((cat, i) => (
                          <tr key={cat.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 text-center text-xs font-bold text-[#0B2545]">{i + 1}</td>
                            <td className={tdBoldCls}>{cat.name}</td>
                            <td className="px-4 py-3 text-right font-semibold text-[#0B2545]">{cat.expenseCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom 5 least-used */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#DEE2E6]">
                  <p className="text-sm font-semibold text-[#0B2545]">Bottom 5 Least-Used Categories</p>
                  <p className="text-xs text-[#6C757D]">By number of expense records</p>
                </div>
                {bottom5.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No data.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#DEE2E6]">
                          <th className={thCls}>Category</th>
                          <th className="px-4 py-3 font-semibold text-[#6C757D] text-right">Expenses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bottom5.map(cat => (
                          <tr key={cat.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                            <td className={tdBoldCls}>{cat.name}</td>
                            <td className="px-4 py-3 text-right text-[#6C757D]">{cat.expenseCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Recent activity */}
          <section>
            <h2 className="text-base font-semibold text-[#0B2545] mb-3">Recent Activity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recently added expenses */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#DEE2E6]">
                  <p className="text-sm font-semibold text-[#0B2545]">Recently Added Expenses</p>
                  <p className="text-xs text-[#6C757D]">Sorted by creation timestamp</p>
                </div>
                {recentExpenses.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No expenses recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#DEE2E6]">
                          <th className={thCls}>Title</th>
                          <th className={thCls}>Category</th>
                          <th className={thCls}>Owner</th>
                          <th className="px-4 py-3 font-semibold text-[#6C757D] text-right">Amount</th>
                          <th className={thCls}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentExpenses.map(exp => (
                          <tr key={exp.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                            <td className={tdBoldCls}>{exp.title}</td>
                            <td className={tdCls}>{getCategoryName(exp.categoryId)}</td>
                            <td className={tdCls}>{getUserName(exp.userId)}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-[#DC3545]">
                              ${exp.amount.toFixed(2)}
                            </td>
                            <td className={tdCls}>{formatDate(exp.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recently registered users */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#DEE2E6]">
                  <p className="text-sm font-semibold text-[#0B2545]">Recently Registered Users</p>
                  <p className="text-xs text-[#6C757D]">Sorted by registration timestamp</p>
                </div>
                {recentUsers.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No users registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#DEE2E6]">
                          <th className={thCls}>Name</th>
                          <th className={thCls}>Email</th>
                          <th className={thCls}>Role</th>
                          <th className={thCls}>Registered</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map(u => (
                          <tr key={u.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                            <td className={tdBoldCls}>{u.name}</td>
                            <td className={tdCls}>{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                u.role === 'ADMIN'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-[#F7F8FA] text-[#6C757D]'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className={tdCls}>{formatDate(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
