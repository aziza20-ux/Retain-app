import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ExpenseFilterState, SortField, SortDir } from '../types';

const initialState: ExpenseFilterState = {
  search:        '',
  categoryId:    '',
  paymentMethod: '',
  dateFrom:      '',
  dateTo:        '',
  sortField:     'date',
  sortDir:       'desc',
};

const expenseFilterSlice = createSlice({
  name: 'expenseFilter',
  initialState,
  reducers: {
    setSearch:        (state, action: PayloadAction<string>)    => { state.search        = action.payload; },
    setCategoryId:    (state, action: PayloadAction<string>)    => { state.categoryId    = action.payload; },
    setPaymentMethod: (state, action: PayloadAction<string>)    => { state.paymentMethod = action.payload; },
    setDateFrom:      (state, action: PayloadAction<string>)    => { state.dateFrom      = action.payload; },
    setDateTo:        (state, action: PayloadAction<string>)    => { state.dateTo        = action.payload; },
    setSortField:     (state, action: PayloadAction<SortField>) => { state.sortField     = action.payload; },
    setSortDir:       (state, action: PayloadAction<SortDir>)   => { state.sortDir       = action.payload; },
    clearFilters:     () => initialState,
  },
});

export const {
  setSearch, setCategoryId, setPaymentMethod,
  setDateFrom, setDateTo, setSortField, setSortDir, clearFilters,
} = expenseFilterSlice.actions;

export default expenseFilterSlice.reducer;
