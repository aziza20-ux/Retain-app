import { useState, useEffect } from 'react';
import Sidebar     from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import StatCard    from '../components/StatCard';
import { adminApi, type InsightsResponse } from '../api/admin.api';
import { getErrorMessage } from '../api/axios';
import { formatDate } from '../utils/budgetUtils';

const fmtCurrency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export default function Admin() {
  const [data,    setData]    = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    adminApi.insights()
      .then(res => setData(res.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const thCls     = 'px-4 py-3 font-semibold text-[#6C757D] text-left';
  const tdCls     = 'px-4 py-3 text-sm text-[#6C757D]';
  const tdBoldCls = 'px-4 py-3 text-sm font-medium text-[#0B2545]';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">

        <div className="px-6 py-6 border-b border-[#DEE2E6] bg-white">
          <h1 className="text-xl font-bold text-[#0B2545]">Admin Dashboard</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">Platform-wide insights</p>
        </div>

        {loading && (
          <div className="px-6 py-12 text-center text-sm text-[#6C757D]">Loading insights…</div>
        )}
        {error && (
          <div className="px-6 py-6">
            <div className="px-4 py-3 bg-red-50 text-[#DC3545] text-sm rounded-lg">{error}</div>
          </div>
        )}

        {data && (
          <div className="px-6 py-6 space-y-8">

            {/* 1. Platform overview */}
            <section>
              <h2 className="text-base font-semibold text-[#0B2545] mb-3">Platform Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Registered Users"    value={data.totalUsers}        variant="dark" />
                <StatCard title="Total Expenses"       value={data.totalExpenses}     variant="default" />
                <SummaryCard title="Total Expense Value" amount={parseFloat(data.totalExpenseValue)} variant="expense" />
                <StatCard
                  title="Expenses This Month"
                  value={data.expensesThisMonth}
                  variant="income"
                  subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                  {data.spendingByCategory.length === 0 ? (
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
                          {data.spendingByCategory.map(cat => (
                            <tr key={cat.categoryId} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                              <td className={tdBoldCls}>{cat.categoryName}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-[#DC3545]">
                                {parseFloat(cat.totalSpent) > 0
                                  ? fmtCurrency(parseFloat(cat.totalSpent))
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
                  {data.topCategories.length === 0 ? (
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
                          {data.topCategories.map((cat, i) => (
                            <tr key={cat.categoryId} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-3 text-center text-xs font-bold text-[#0B2545]">{i + 1}</td>
                              <td className={tdBoldCls}>{cat.categoryName}</td>
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
                  {data.bottomCategories.length === 0 ? (
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
                          {data.bottomCategories.map(cat => (
                            <tr key={cat.categoryId} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                              <td className={tdBoldCls}>{cat.categoryName}</td>
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
                  {data.recentExpenses.length === 0 ? (
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
                          {data.recentExpenses.map(exp => (
                            <tr key={exp.id} className="border-b border-[#DEE2E6] last:border-0 hover:bg-gray-50">
                              <td className={tdBoldCls}>{exp.title}</td>
                              <td className={tdCls}>{exp.category?.name ?? 'Uncategorized'}</td>
                              <td className={tdCls}>{exp.user.name}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-[#DC3545]">
                                ${parseFloat(exp.amount).toFixed(2)}
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
                  {data.recentUsers.length === 0 ? (
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
                          {data.recentUsers.map(u => (
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
        )}
      </main>
    </div>
  );
}
