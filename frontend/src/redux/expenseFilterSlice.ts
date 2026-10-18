import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExpenseFilterState, SortField, SortDir } from "../types";

const initialState: ExpenseFilterState = {
  search: "",
  categoryId: "",
  paymentMethod: "",
  dateFrom: "",
  dateTo: "",
  sortField: "date",
  sortDir: "desc",
  page: 1,
};

const expenseFilterSlice = createSlice({
  name: "expenseFilter",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setCategoryId: (state, action: PayloadAction<string>) => {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateFrom: (state, action: PayloadAction<string>) => {
      state.dateFrom = action.payload;
      state.page = 1;
    },
    setDateTo: (state, action: PayloadAction<string>) => {
      state.dateTo = action.payload;
      state.page = 1;
    },
    setSortField: (state, action: PayloadAction<SortField>) => {
      state.sortField = action.payload;
      state.page = 1;
    },
    setSortDir: (state, action: PayloadAction<SortDir>) => {
      state.sortDir = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearFilters: () => initialState,
  },
});

export const {
  setSearch,
  setCategoryId,
  setPaymentMethod,
  setDateFrom,
  setDateTo,
  setSortField,
  setSortDir,
  setPage,
  clearFilters,
} = expenseFilterSlice.actions;

export default expenseFilterSlice.reducer;
