import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Sidebar     from '../components/Sidebar';
import SummaryCard from '../components/SummaryCard';
import StatCard    from '../components/StatCard';
import { adminApi, type InsightsResponse } from '../api/admin.api';
import { getErrorMessage } from '../api/axios';
import { formatDate, formatRWF } from '../utils/budgetUtils';

const fmtCurrency = (n: number) => formatRWF(n);

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

  const DONUT_COLORS = ['#0B2545', '#DC3545', '#198754', '#FFC107', '#0DCAF0'];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-12 md:pt-0">

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

                {/* Spending per category — horizontal bar chart */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#DEE2E6]">
                    <p className="text-sm font-semibold text-[#0B2545]">Spending by Category</p>
                    <p className="text-xs text-[#6C757D]">Total monetary value per category</p>
                  </div>
                  {data.spendingByCategory.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No expense data.</p>
                  ) : (
                    <div className="px-2 py-4">
                      <ResponsiveContainer width="100%" height={data.spendingByCategory.length * 44 + 16}>
                        <BarChart
                          layout="vertical"
                          data={data.spendingByCategory.map(c => ({ name: c.categoryName, value: parseFloat(c.totalSpent) }))}
                          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#DEE2E6" />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#6C757D' }}
                            tickFormatter={(v: number) => `${v.toLocaleString()} RWF`}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fontSize: 11, fill: '#0B2545' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(v) => [fmtCurrency(Number(v)), 'Total Spent']}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DEE2E6' }}
                          />
                          <Bar dataKey="value" fill="#DC3545" radius={[0, 4, 4, 0]} maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Top 5 most-used — doughnut chart */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#DEE2E6]">
                    <p className="text-sm font-semibold text-[#0B2545]">Top 5 Most-Used Categories</p>
                    <p className="text-xs text-[#6C757D]">By number of expense records</p>
                  </div>
                  {data.topCategories.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No data.</p>
                  ) : (
                    <div className="px-2 py-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={data.topCategories.slice(0, 5).map(c => ({ name: c.categoryName, value: c.expenseCount }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {data.topCategories.slice(0, 5).map((_, i) => (
                              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => [Number(v), 'Expenses']}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DEE2E6' }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={v => <span style={{ fontSize: 11, color: '#0B2545' }}>{v}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Bottom 5 least-used — vertical bar chart */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#DEE2E6]">
                    <p className="text-sm font-semibold text-[#0B2545]">Bottom 5 Least-Used Categories</p>
                    <p className="text-xs text-[#6C757D]">By number of expense records</p>
                  </div>
                  {data.bottomCategories.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-[#6C757D] text-center">No data.</p>
                  ) : (
                    <div className="px-2 py-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={data.bottomCategories.slice(0, 5).map(c => ({ name: c.categoryName, value: c.expenseCount }))}
                          margin={{ top: 4, right: 8, left: -16, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DEE2E6" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: '#6C757D' }}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#6C757D' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            formatter={(v) => [Number(v), 'Expenses']}
                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #DEE2E6' }}
                          />
                          <Bar dataKey="value" fill="#0B2545" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
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
                                {formatRWF(parseFloat(exp.amount))}
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
