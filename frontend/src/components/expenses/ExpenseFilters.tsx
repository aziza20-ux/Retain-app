import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  setSearch, setCategoryId, setPaymentMethod,
  setDateFrom, setDateTo, setSortField, setSortDir, clearFilters,
} from '../../redux/expenseFilterSlice';
import { PM_LABEL } from '../../utils/budgetUtils';
import type { Category, PaymentMethod, SortField } from '../../types';

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'OTHER'];

interface ExpenseFiltersProps {
  categories: Category[];
}

export default function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const dispatch = useAppDispatch();
  const filters  = useAppSelector(s => s.expenseFilter);

  const hasActiveFilters =
    !!filters.search || !!filters.categoryId || !!filters.paymentMethod ||
    !!filters.dateFrom || !!filters.dateTo ||
    filters.sortField !== 'date' || filters.sortDir !== 'desc';

  const handleSortField = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSortField(e.target.value as SortField));
  };

  const handleSortDir = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSortDir(e.target.value as 'asc' | 'desc'));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      {/* Row 1: search, category, payment method */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title or notes…"
          value={filters.search}
          onChange={e => dispatch(setSearch(e.target.value))}
          className="flex-1 px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
        />
        <select
          value={filters.categoryId}
          onChange={e => dispatch(setCategoryId(e.target.value))}
          className="px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.paymentMethod}
          onChange={e => dispatch(setPaymentMethod(e.target.value))}
          className="px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white"
        >
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(m => (
            <option key={m} value={m}>{PM_LABEL[m]}</option>
          ))}
        </select>
      </div>

      {/* Row 2: date range, sort, clear */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-[#6C757D] whitespace-nowrap">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => dispatch(setDateFrom(e.target.value))}
            className="flex-1 px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-[#6C757D] whitespace-nowrap">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => dispatch(setDateTo(e.target.value))}
            className="flex-1 px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#6C757D] whitespace-nowrap">Sort by</label>
          <select
            value={filters.sortField}
            onChange={handleSortField}
            className="px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
          <select
            value={filters.sortDir}
            onChange={handleSortDir}
            className="px-3 py-2 border border-[#DEE2E6] rounded-lg text-sm focus:outline-none focus:border-[#0B2545] bg-white"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="px-3 py-2 text-sm text-[#DC3545] border border-[#DC3545] rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
