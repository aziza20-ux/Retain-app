# Retain — Personal Expense & Budget Manager

Retain is a full-stack web application that helps individuals track their daily expenses, manage monthly budgets, and understand their spending habits through analytics and category-based summaries. It provides a clean dashboard for regular users and a platform-wide insights panel for administrators.

---

## Table of Contents

1. [Main Features](#main-features)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation and Setup](#installation-and-setup)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Database Overview](#database-overview)
9. [Available Commands](#available-commands)
10. [Authentication and Authorization](#authentication-and-authorization)
11. [Troubleshooting](#troubleshooting)
12. [Future Improvements](#future-improvements)

---

## Main Features

### Fully Implemented

- **User registration and login** — email/password authentication with JWT tokens; passwords hashed with bcrypt.
- **Session persistence** — JWT stored in `localStorage`; session restored automatically on page reload via `GET /auth/me`.
- **Expense management** — create, view, edit, and delete personal expense records with title, amount, date, payment method, category, and optional notes.
- **Expense filtering and search** — filter by category, payment method, and date range; full-text search across title and notes.
- **Expense sorting** — sort by date or amount in ascending or descending order.
- **Expense pagination** — paginated expense list (10 records per page on the frontend); the backend supports configurable `page` and `limit` query parameters (default 20, maximum 100).
- **Payment methods** — Cash, Card, Mobile Money, Bank Transfer, Other.
- **Expense categories** — expenses are assigned to categories; a built-in "Uncategorized" fallback is always available.
- **Monthly budget management** — create, edit, and delete one budget per calendar month; one budget per user per month enforced at the database level.
- **Budget calculations** — each budget response includes `totalSpent`, `remaining`, and a `status` field (`WITHIN`, `APPROACHING` at ≥ 80%, `OVER` at ≥ 100%).
- **Dashboard** — month selector with summary cards (total spent, remaining budget, highest expense, budget limit), a budget progress bar, recent transactions, and a spending-by-category breakdown.
- **Category spending summary** — `GET /expenses/summary` returns per-category totals for the authenticated user, optionally filtered to a single calendar month.
- **Role-based access control** — `USER` and `ADMIN` roles; admin routes are protected by both authentication and role middleware.
- **Admin dashboard** — platform-wide metrics: total users, total expenses, total expense value, expenses this month, spending by category (horizontal bar chart), top 5 most-used categories (doughnut chart), bottom 5 least-used categories (vertical bar chart), recently added expenses, recently registered users.
- **Category management (admin)** — admins can create, edit, and delete categories; deleting a category reassigns all its expenses to "Uncategorized" in a single database transaction.
- **Responsive layout** — collapsible sidebar on desktop; hamburger menu on mobile.


---

## Technologies Used

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.8 | UI component library |
| TypeScript | ~6.0.2 | Static typing |
| Vite | ^8.3.0 | Build tool and dev server |
| Tailwind CSS | ^4.3.3 | Utility-first styling |
| React Router DOM | ^7.18.4 | Client-side routing |
| Redux Toolkit | ^2.13.0 | Expense filter and sort state |
| React Redux | ^9.3.0 | React bindings for Redux |
| Axios | ^1.20.0 | HTTP client |
| Recharts | ^3.10.1 | Charts on the admin dashboard |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js (ESM) | — | Runtime |
| Express | ^5.3.0 | HTTP framework |
| Helmet | ^8.3.0 | Security headers |
| CORS | ^2.8.6 | Cross-origin request handling |
| express-rate-limit | ^8.7.1 | Rate limiting on auth endpoints |
| bcrypt | ^6.0.0 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT signing and verification |
| Zod | ^4.6.7 | Request validation and schema parsing |
| dotenv | ^18.0.7 | Environment variable loading |
| nodemon | ^3.1.14 | Dev server auto-restart |

### Database and ORM

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | — | Relational database |
| Prisma | ^7.10.0 | ORM, migrations, and client generation |
| @prisma/adapter-pg | ^7.10.0 | PostgreSQL driver adapter for Prisma |

---

## Project Structure

```
Retain-app/
├── README.md
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # SQL migration files
│   │   ├── schema.prisma        # Database schema and model definitions
│   │   └── seed.js              # Seeds admin user and default categories
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.config.js # Prisma client instantiation
│   │   ├── controllers/         # Route handler logic
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── budget.controller.js
│   │   │   ├── category.controller.js
│   │   │   └── expense.controller.js
│   │   ├── generated/prisma/    # Auto-generated Prisma client (do not edit)
│   │   ├── middlewares/
│   │   │   ├── isAdmin.middleware.js
│   │   │   └── isAuthenticated.middleware.js
│   │   ├── routes/              # Express routers
│   │   │   ├── admin.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── budget.routes.js
│   │   │   ├── category.routes.js
│   │   │   └── expense.routes.js
│   │   ├── schemas/             # Zod validation schemas
│   │   │   ├── budget.schema.js
│   │   │   ├── category.schema.js
│   │   │   ├── expense.schema.js
│   │   │   └── user.schema.js
│   │   └── app.js               # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── prisma7.config.ts        # Prisma CLI configuration file
└── frontend/
    ├── src/
    │   ├── api/                 # Axios API service functions
    │   │   ├── admin.api.ts
    │   │   ├── auth.api.ts
    │   │   ├── axios.ts         # Axios instance and JWT interceptor
    │   │   ├── budget.api.ts
    │   │   ├── category.api.ts
    │   │   └── expense.api.ts
    │   ├── components/
    │   │   ├── budgets/
    │   │   │   └── BudgetCard.tsx
    │   │   ├── expenses/
    │   │   │   ├── ExpenseDetails.tsx
    │   │   │   ├── ExpenseFilters.tsx
    │   │   │   ├── ExpenseForm.tsx
    │   │   │   └── ExpenseList.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── StatCard.tsx
    │   │   └── SummaryCard.tsx
    │   ├── context/
    │   │   ├── AppDataContext.tsx  # Expenses, budgets, categories state
    │   │   └── AuthContext.tsx     # Authentication state and actions
    │   ├── pages/
    │   │   ├── Admin.tsx
    │   │   ├── AdminCategories.tsx
    │   │   ├── Budgets.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Expenses.tsx
    │   │   ├── Login.tsx
    │   │   └── Register.tsx
    │   ├── redux/
    │   │   ├── expenseFilterSlice.ts  # Filter, sort, and pagination state
    │   │   ├── hooks.ts
    │   │   └── store.ts
    │   ├── types/
    │   │   └── index.ts           # Shared TypeScript interfaces and types
    │   ├── utils/
    │   │   └── budgetUtils.ts     # Budget calculations and formatting helpers
    │   ├── App.tsx                # Routes and protected route wrappers
    │   └── main.tsx               # React entry point
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js** v18 or later (the backend uses `--experimental-strip-types`, available from Node.js 22.6+; Node.js 22 LTS is recommended)
- **npm** v9 or later
- **PostgreSQL** v14 or later, running locally or accessible via a connection string

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd Retain-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure backend environment variables

```bash
# From the backend directory
cp .env.example .env
```

Open `backend/.env` and fill in the required values (see [Environment Variables](#environment-variables)).

### 5. Configure frontend environment variables

```bash
# From the frontend directory
cp .env.example .env
```

The default value (`http://localhost:3001/api`) works for local development without changes.

### 6. Set up the PostgreSQL database

Create a PostgreSQL database and update `DATABASE_URL` in `backend/.env` with your connection string.

```
postgresql://USER:PASSWORD@localhost:5432/retain_db
```

### 7. Run database migrations

Prisma 7 uses a configuration file (`prisma7.config.ts`). Run migrations from the `backend` directory:

```bash
# From the backend directory
npx prisma migrate deploy --config prisma7.config.ts
```

> For local development you can also use `npx prisma migrate dev --config prisma7.config.ts` to apply migrations and generate the client in one step.

### 8. Generate the Prisma client

```bash
# From the backend directory
npx prisma generate --config prisma7.config.ts
```

The generated client is output to `src/generated/prisma/` as configured in `schema.prisma`.

### 9. Seed the database

The seed script creates the default admin user and the 10 default expense categories:

```bash
# From the backend directory
npm run seed
```

This creates:
- Admin account: `admin@retain.app` / `Admin@1234`
- Categories: Uncategorized, Food & Dining, Transport, Housing, Healthcare, Entertainment, Shopping, Education, Savings & Investments, Other

> Change the admin password after first login in a production environment.

### 10. Start the backend server

```bash
# From the backend directory
npm run dev
```

The server starts on `http://localhost:3001` by default.

### 11. Start the frontend dev server

```bash
# From the frontend directory
npm run dev
```

The frontend starts on `http://localhost:5173` by default.

### 12. Access the application

Open `http://localhost:5173` in your browser. Register a new user account or log in with the seeded admin credentials.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/retain_db` |
| `JWT_SECRET` | Yes | Secret key for signing and verifying JWTs. Use a long random string. | `replace-with-a-long-random-secret` |
| `PORT` | No | Port the Express server listens on. Defaults to `3001`. | `3001` |
| `CLIENT_URL` | No | Frontend origin allowed by CORS. Defaults to `http://localhost:5173`. | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend API. | `http://localhost:3001/api` |

---

## API Documentation

All endpoints are prefixed with `/api`. The base URL is configured via `VITE_API_BASE_URL` on the frontend.

### Authentication

Authenticated endpoints require the header:

```
Authorization: Bearer <token>
```

The token is returned by `POST /auth/login` and has a 7-day expiry.

**Validation errors** return HTTP 400 with the shape:

```json
{
  "message": "Validation failed",
  "errors": { "fieldName": ["error message"] }
}
```

---

### Auth Endpoints

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive a JWT | No |
| `POST` | `/api/auth/logout` | Invalidate the session (server-side acknowledgement) | Yes |
| `GET` | `/api/auth/me` | Return the authenticated user's profile | Yes |

#### `POST /api/auth/register`

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1–100 characters |
| `email` | string | Required, valid email, lowercased |
| `password` | string | Required, 8–128 characters |

**Responses:** `201 { user }` · `400` validation error · `409` email already registered

#### `POST /api/auth/login`

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email |
| `password` | string | Required |

**Responses:** `200 { token, user }` · `400` validation error · `401` invalid credentials

#### `GET /api/auth/me`

**Responses:** `200 { user }` · `401` unauthenticated

---

### Expense Endpoints

All expense endpoints require authentication. Users can only access their own expenses.

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/expenses` | Create a new expense | Yes |
| `GET` | `/api/expenses` | List expenses with filtering, sorting, and pagination | Yes |
| `GET` | `/api/expenses/summary` | Spending totals grouped by category | Yes |
| `GET` | `/api/expenses/:id` | Get a single expense by ID | Yes |
| `PATCH` | `/api/expenses/:id` | Update an expense | Yes |
| `DELETE` | `/api/expenses/:id` | Delete an expense | Yes |

#### `POST /api/expenses`

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required, 1–200 characters |
| `amount` | number | Required, positive |
| `date` | string | Required, ISO 8601, not in the future |
| `paymentMethod` | string | Required, one of: `CASH`, `CARD`, `MOBILE_MONEY`, `BANK_TRANSFER`, `OTHER` |
| `categoryId` | string | Required, valid UUID of an existing category |
| `notes` | string | Optional, max 1000 characters |

**Responses:** `201 { expense }` · `400` validation error · `404` category not found

#### `GET /api/expenses`

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Records per page (max 100) |
| `sortBy` | `date` \| `amount` | `date` | Sort field |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |
| `search` | string | — | Full-text search across title and notes |
| `categoryId` | UUID | — | Filter by category |
| `paymentMethod` | enum | — | Filter by payment method |
| `startDate` | ISO 8601 | — | Filter expenses on or after this date |
| `endDate` | ISO 8601 | — | Filter expenses on or before this date |

**Response:**

```json
{
  "expenses": [ /* array of expense objects */ ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### `GET /api/expenses/summary`

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `month` | ISO 8601 | Optional. Restricts totals to the calendar month of this date. |

**Response:**

```json
{
  "summary": [
    {
      "categoryId": "uuid",
      "categoryName": "Food & Dining",
      "totalSpent": "142.50",
      "expenseCount": 7
    }
  ]
}
```

---

### Budget Endpoints

All budget endpoints require authentication. Users can only access their own budgets.

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/budgets` | Create a monthly budget | Yes |
| `GET` | `/api/budgets` | List all budgets for the authenticated user | Yes |
| `GET` | `/api/budgets/month` | Get the budget for a specific month | Yes |
| `PATCH` | `/api/budgets/:id` | Update a budget's amount | Yes |
| `DELETE` | `/api/budgets/:id` | Delete a budget | Yes |

#### `POST /api/budgets`

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `amount` | number | Required, positive |
| `month` | string | Required, ISO 8601. Normalized to the first day of the month. |

**Responses:** `201 { budget }` · `400` validation error · `409` budget already exists for this month

#### `GET /api/budgets`

**Query parameters (all optional):**

| Parameter | Type | Description |
|---|---|---|
| `month` | ISO 8601 | Return only the budget for this specific month |
| `startMonth` | ISO 8601 | Return budgets from this month onwards |
| `endMonth` | ISO 8601 | Return budgets up to and including this month |

**Response:** `200 { budgets: [ /* BudgetWithCalc objects */ ] }`

Each budget object includes computed fields:

| Field | Type | Description |
|---|---|---|
| `totalSpent` | string | Sum of expenses in the budget month (serialized Decimal) |
| `remaining` | string | `amount − totalSpent` (serialized Decimal) |
| `status` | string | `WITHIN`, `APPROACHING` (≥ 80%), or `OVER` (≥ 100%) |

#### `GET /api/budgets/month`

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `month` | ISO 8601 | Yes | The month to look up |

**Responses:** `200 { budget }` · `404` no budget for this month

---

### Category Endpoints

Reading categories is public. Creating, updating, and deleting categories requires authentication and the `ADMIN` role.

| Method | Path | Description | Auth Required | Role |
|---|---|---|---|---|
| `GET` | `/api/categories` | List all categories | No | — |
| `GET` | `/api/categories/:id` | Get a single category | No | — |
| `POST` | `/api/categories` | Create a category | Yes | `ADMIN` |
| `PATCH` | `/api/categories/:id` | Update a category | Yes | `ADMIN` |
| `DELETE` | `/api/categories/:id` | Delete a category (reassigns expenses to Uncategorized) | Yes | `ADMIN` |

#### `POST /api/categories` / `PATCH /api/categories/:id`

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required for create, optional for update; 1–100 characters, unique |
| `description` | string | Optional, max 500 characters |

**Notes:**
- The `Uncategorized` category cannot be deleted.
- Deleting any other category reassigns all its expenses to `Uncategorized` in a single database transaction.

---

### Admin Endpoints

All admin endpoints require authentication and the `ADMIN` role.

| Method | Path | Description | Auth Required | Role |
|---|---|---|---|---|
| `GET` | `/api/admin/insights` | Platform-wide analytics | Yes | `ADMIN` |

#### `GET /api/admin/insights`

**Response:**

```json
{
  "totalUsers": 12,
  "totalExpenses": 340,
  "totalExpenseValue": "18420.50",
  "expensesThisMonth": 47,
  "spendingByCategory": [ /* CategoryInsight[] */ ],
  "topCategories": [ /* top 5 CategoryInsight[] by expense count */ ],
  "bottomCategories": [ /* bottom 5 CategoryInsight[] by expense count */ ],
  "recentExpenses": [ /* last 10 expenses platform-wide */ ],
  "recentUsers": [ /* last 10 registered users */ ]
}
```

Each `CategoryInsight` object:

```json
{
  "categoryId": "uuid",
  "categoryName": "Transport",
  "expenseCount": 23,
  "totalSpent": "1045.00"
}
```

---

## Database Overview

The database has three main models:

### User
Stores registered users. Each user has a `role` of `USER` (default) or `ADMIN`. Passwords are stored as bcrypt hashes. Deleting a user cascades to delete all their expenses and budgets.

### Category
Stores expense categories. Category names are unique. The `Uncategorized` category is the protected fallback — it cannot be deleted. Categories are shared across all users (not user-scoped).

### Expense
Stores individual expense records. Each expense belongs to one user and one category. The `amount` field uses `Decimal(12, 2)` to avoid floating-point imprecision. Deleting a category is blocked at the database level (`onDelete: Restrict`) — the service layer must reassign expenses first.

### Budget
Stores monthly budgets. One budget per user per month is enforced by a unique constraint on `(userId, month)`. The `month` field is always normalized to the first day of the month (UTC). `totalSpent`, `remaining`, and `status` are computed at query time, not stored.

### Relationships

```
User ──< Expense >── Category
User ──< Budget
```

---

## Available Commands

### Backend (`backend/` directory)

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with nodemon (auto-restart on file changes) |
| `npm start` | Start the server without nodemon |
| `npm run seed` | Seed the database with the admin user and default categories |
| `npm test` | Run the test suite once with Vitest |
| `npm run test:watch` | Run tests in watch mode |

### Frontend (`frontend/` directory)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check with TypeScript and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Prisma (`backend/` directory)

| Command | Description |
|---|---|
| `npx prisma migrate dev --config prisma7.config.ts` | Apply pending migrations and regenerate the client (development) |
| `npx prisma migrate deploy --config prisma7.config.ts` | Apply pending migrations without regenerating the client (production/CI) |
| `npx prisma generate --config prisma7.config.ts` | Regenerate the Prisma client after schema changes |
| `npx prisma studio --config prisma7.config.ts` | Open Prisma Studio (database browser) |

> All Prisma commands must include `--config prisma7.config.ts` because the project uses a non-default configuration file.

---

## Authentication and Authorization

### Flow

1. The user registers via `POST /auth/register` or logs in via `POST /auth/login`.
2. On successful login, the server returns a signed JWT containing `{ sub: userId, role }` with a 7-day expiry.
3. The frontend stores the token in `localStorage` and attaches it to every subsequent request as `Authorization: Bearer <token>`.
4. On page load, the frontend calls `GET /auth/me` to restore the session if a token exists.
5. On logout, the frontend calls `POST /auth/logout` (server acknowledgement) and removes the token from `localStorage`.

### Middleware

- **`isAuthenticated`** — verifies the JWT using `JWT_SECRET`. Attaches `{ id, role }` to `req.user`. Returns `401` if the token is missing, malformed, or expired.
- **`isAdmin`** — checks that `req.user.role === 'ADMIN'`. Returns `403` if the user is authenticated but not an admin.

### Role-based access

| Role | Permissions |
|---|---|
| `USER` | Manage own expenses and budgets; read categories |
| `ADMIN` | All USER permissions; create/edit/delete categories; access platform-wide admin insights |

Users cannot access other users' expenses or budgets. Ownership is enforced in each controller by comparing `expense.userId` or `budget.userId` against `req.user.id`.

---

## Troubleshooting

### Database connection fails on startup

- Verify that PostgreSQL is running and accessible.
- Check that `DATABASE_URL` in `backend/.env` is correct, including the username, password, host, port, and database name.
- Ensure the database exists before running migrations.

### `JWT_SECRET` is missing or undefined

The backend will fail to sign or verify tokens if `JWT_SECRET` is not set. Confirm the variable is present in `backend/.env` and that `dotenv/config` is imported at the top of `app.js`.

### Prisma migration or client errors

- Always include `--config prisma7.config.ts` in Prisma CLI commands. Omitting it causes Prisma to look for the default `prisma/schema.prisma` configuration and may fail to locate the correct datasource or output path.
- If the generated client is missing or stale, run `npx prisma generate --config prisma7.config.ts` from the `backend` directory.
- After pulling schema changes from version control, run `npx prisma migrate deploy --config prisma7.config.ts` before starting the server.

### Frontend cannot reach the backend

- Confirm the backend is running on the port specified in `backend/.env` (default `3001`).
- Confirm `VITE_API_BASE_URL` in `frontend/.env` matches the backend address (default `http://localhost:3001/api`).
- Check that `CLIENT_URL` in `backend/.env` matches the frontend origin (default `http://localhost:5173`) so CORS allows the request.

### Seed script fails with "Uncategorized category does not exist"

Run `npm run seed` from the `backend` directory before starting the application. The seed script creates the `Uncategorized` category that the category deletion logic depends on.

### Node.js version compatibility

The backend uses `--experimental-strip-types` to run TypeScript-annotated `.js` files directly. This flag requires **Node.js 22.6 or later**. If you see an error about an unrecognized flag, upgrade Node.js.

---