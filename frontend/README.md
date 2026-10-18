# Retain — Frontend

The React + TypeScript frontend for Retain, a personal expense and budget manager. It communicates with the Retain backend API and provides a responsive UI for managing expenses, budgets, and categories.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Pages and Routes](#pages-and-routes)
9. [State Management](#state-management)
10. [API Layer](#api-layer)
11. [TypeScript Configuration](#typescript-configuration)
12. [Linting](#linting)

---

## Overview

The frontend is a single-page application built with React 19 and TypeScript. It uses:

- **React Context** for authentication state (`AuthContext`) and shared application data — expenses, budgets, and categories (`AppDataContext`).
- **Redux Toolkit** for expense filter, sort, and pagination state (`expenseFilterSlice`).
- **Axios** for all HTTP communication with the backend, with a request interceptor that automatically attaches the JWT from `localStorage`.
- **Recharts** for the admin dashboard charts.
- **Tailwind CSS** for all styling.
- **React Router DOM v7** for client-side routing with protected and admin-only route wrappers.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| React | ^19.2.8 | UI library |
| TypeScript | ~6.0.2 | Static typing |
| Vite | ^8.3.0 | Build tool and dev server |
| Tailwind CSS | ^4.3.3 | Utility-first CSS |
| React Router DOM | ^7.18.4 | Client-side routing |
| Redux Toolkit | ^2.13.0 | Filter/sort/pagination state |
| React Redux | ^9.3.0 | React bindings for Redux |
| Axios | ^1.20.0 | HTTP client |
| Recharts | ^3.10.1 | Admin dashboard charts |

---

## Project Structure

```
frontend/
├── public/                  # Static assets served as-is
├── src/
│   ├── api/                 # Axios service functions, one file per resource
│   │   ├── admin.api.ts     # GET /admin/insights
│   │   ├── auth.api.ts      # register, login, logout, getMe + tokenStore helpers
│   │   ├── axios.ts         # Axios instance, JWT interceptor, getErrorMessage
│   │   ├── budget.api.ts    # CRUD for budgets
│   │   ├── category.api.ts  # CRUD for categories
│   │   └── expense.api.ts   # CRUD + summary for expenses
│   ├── components/
│   │   ├── budgets/
│   │   │   └── BudgetCard.tsx       # Budget card with progress bar and status badge
│   │   ├── expenses/
│   │   │   ├── ExpenseDetails.tsx   # Read-only expense detail modal
│   │   │   ├── ExpenseFilters.tsx   # Filter/sort controls (reads/writes Redux)
│   │   │   ├── ExpenseForm.tsx      # Create/edit expense modal form
│   │   │   └── ExpenseList.tsx      # Sortable expense table
│   │   ├── Sidebar.tsx      # Collapsible desktop sidebar + mobile hamburger menu
│   │   ├── StatCard.tsx     # Integer metric card (used on admin dashboard)
│   │   └── SummaryCard.tsx  # Currency metric card (used on dashboard)
│   ├── context/
│   │   ├── AppDataContext.tsx  # Expenses, budgets, categories — fetched from API
│   │   └── AuthContext.tsx     # User session, login, register, logout
│   ├── data/
│   │   └── mockData.ts      # Static mock data (not used in production flows)
│   ├── pages/
│   │   ├── Admin.tsx            # Platform-wide insights + charts (ADMIN only)
│   │   ├── AdminCategories.tsx  # Category CRUD table (ADMIN only)
│   │   ├── Budgets.tsx          # Monthly budget management
│   │   ├── Dashboard.tsx        # Monthly spending overview
│   │   ├── Expenses.tsx         # Expense list with filters, sort, and pagination
│   │   ├── Login.tsx            # Login form
│   │   └── Register.tsx         # Registration form
│   ├── redux/
│   │   ├── expenseFilterSlice.ts  # search, categoryId, paymentMethod, dates, sort, page
│   │   ├── hooks.ts               # Typed useAppDispatch and useAppSelector
│   │   └── store.ts               # Redux store with expenseFilter reducer
│   ├── types/
│   │   └── index.ts           # All shared TypeScript interfaces and type aliases
│   ├── utils/
│   │   └── budgetUtils.ts     # Date helpers, budget calculations, formatting, chart utils
│   ├── App.tsx                # Route definitions, ProtectedRoute, AdminRoute
│   ├── index.css              # Tailwind base import
│   └── main.tsx               # React entry point — Provider, AuthProvider, AppDataProvider
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Prerequisites

- **Node.js** 18 or later (22 LTS recommended)
- **npm** 9 or later
- The Retain backend must be running and reachable at the URL set in `VITE_API_BASE_URL`

---

## Installation

```bash
# From the frontend directory
npm install
```

---

## Environment Variables

Copy the example file and set the backend URL:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:3001/api` | Base URL of the Retain backend API |

The default value works for local development without changes.

---

## Available Scripts

Run all commands from the `frontend/` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR on `http://localhost:5173` |
| `npm run build` | Type-check with `tsc -b` then build for production into `dist/` |
| `npm run preview` | Serve the production build locally for testing |
| `npm run lint` | Run ESLint across all `.ts` and `.tsx` files |

---

## Pages and Routes

| Path | Component | Access |
|---|---|---|
| `/` | Redirects to `/login` | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/dashboard` | `Dashboard` | Authenticated |
| `/expenses` | `Expenses` | Authenticated |
| `/budgets` | `Budgets` | Authenticated |
| `/admin` | `Admin` | ADMIN role only |
| `/admin/categories` | `AdminCategories` | ADMIN role only |
| `*` | Redirects to `/login` | — |

### Route guards

- `ProtectedRoute` — redirects unauthenticated users to `/login`. Renders nothing while the session is being restored on first load.
- `AdminRoute` — redirects unauthenticated users to `/login` and non-admin users to `/dashboard`.

---

## State Management

### React Context

**`AuthContext`** (`src/context/AuthContext.tsx`)

Manages the user session. On first mount it calls `GET /auth/me` to restore a session from a stored JWT. Exposes:

| Value | Type | Description |
|---|---|---|
| `user` | `User \| null` | The authenticated user object |
| `role` | `Role \| null` | `"USER"` or `"ADMIN"` |
| `isAuthenticated` | `boolean` | Whether a user is logged in |
| `isLoading` | `boolean` | True while the initial session check is in progress |
| `login` | function | Calls `POST /auth/login`, stores the token, returns an error string or `null` |
| `register` | function | Calls `POST /auth/register`, returns an error string or `null` |
| `logout` | function | Calls `POST /auth/logout`, clears the token |

**`AppDataContext`** (`src/context/AppDataContext.tsx`)

Fetches and caches expenses, budgets, and categories from the API when the user is authenticated. Exposes the arrays and CRUD action functions to all consumers. Budget Decimal strings from the backend are converted to numbers on load.

### Redux

The Redux store (`src/redux/store.ts`) holds a single slice: `expenseFilter`.

**`expenseFilterSlice`** (`src/redux/expenseFilterSlice.ts`)

| Field | Type | Default | Description |
|---|---|---|---|
| `search` | `string` | `""` | Full-text search query |
| `categoryId` | `string` | `""` | Filter by category UUID |
| `paymentMethod` | `string` | `""` | Filter by payment method enum value |
| `dateFrom` | `string` | `""` | ISO date lower bound |
| `dateTo` | `string` | `""` | ISO date upper bound |
| `sortField` | `"date" \| "amount"` | `"date"` | Sort field |
| `sortDir` | `"asc" \| "desc"` | `"desc"` | Sort direction |
| `page` | `number` | `1` | Current page (resets to 1 on any filter or sort change) |

Actions: `setSearch`, `setCategoryId`, `setPaymentMethod`, `setDateFrom`, `setDateTo`, `setSortField`, `setSortDir`, `setPage`, `clearFilters`.

Use the typed hooks from `src/redux/hooks.ts`:

```ts
const dispatch = useAppDispatch();
const filters  = useAppSelector(s => s.expenseFilter);
```

---

## API Layer

All API calls are in `src/api/`. Each file exports a typed service object and the relevant response/payload interfaces.

| File | Exports |
|---|---|
| `axios.ts` | Configured Axios instance, `getErrorMessage(err)` |
| `auth.api.ts` | `authApi`, `tokenStore`, `userRole` |
| `expense.api.ts` | `expenseApi`, `ExpenseListResponse`, `ExpenseQuery`, `ExpensePayload` |
| `budget.api.ts` | `budgetApi`, `BudgetCalc`, `BudgetListResponse` |
| `category.api.ts` | `categoryApi`, `CategoryListResponse` |
| `admin.api.ts` | `adminApi`, `InsightsResponse`, `CategoryInsight`, `RecentExpense`, `RecentUser` |

The Axios instance reads `VITE_API_BASE_URL` from the Vite environment and attaches `Authorization: Bearer <token>` from `localStorage` on every request via a request interceptor.

---

## TypeScript Configuration

The project uses two `tsconfig` files composed via `tsconfig.json`:

- **`tsconfig.app.json`** — compiles `src/`. Target `ES2023`, bundler module resolution, `noEmit: true` (Vite handles the actual emit). Strict linting flags enabled: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`.
- **`tsconfig.node.json`** — compiles Vite config files.

The `build` script runs `tsc -b` before Vite to catch type errors before bundling.

---

## Linting

ESLint is configured in `eslint.config.js` using the flat config format. Active rule sets:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-react-refresh` (Vite preset)

Run the linter:

```bash
npm run lint
```
