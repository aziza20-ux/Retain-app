# Retain — Backend

The Node.js + Express REST API for Retain, a personal expense and budget manager. It handles authentication, expense and budget management, category administration, and platform-wide admin analytics.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Database Setup](#database-setup)
9. [API Reference](#api-reference)
10. [Middleware](#middleware)
11. [Validation](#validation)
12. [Error Handling](#error-handling)
13. [Testing](#testing)
14. [Security](#security)

---

## Overview

The backend is a RESTful API built with Express 5 and Node.js ESM. It uses Prisma 7 as the ORM against a PostgreSQL database, Zod for request validation, bcrypt for password hashing, and JSON Web Tokens for stateless authentication.

All routes are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>` headers — no cookies or sessions.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| Express | ^5.3.0 | HTTP framework |
| Prisma | ^7.10.0 | ORM, migrations, client generation |
| @prisma/adapter-pg | ^7.10.0 | PostgreSQL driver adapter |
| bcrypt | ^6.0.0 | Password hashing (cost factor 12) |
| jsonwebtoken | ^9.0.3 | JWT signing and verification (7-day expiry) |
| Zod | ^4.6.7 | Request body and query parameter validation |
| Helmet | ^8.3.0 | HTTP security headers |
| CORS | ^2.8.6 | Cross-origin request handling |
| express-rate-limit | ^8.7.1 | Rate limiting on auth endpoints |
| dotenv | ^18.0.7 | Environment variable loading |
| nodemon | ^3.1.14 | Dev server auto-restart |
| Vitest | ^5.0.5 | Test runner |
| Supertest | ^7.3.1 | HTTP integration testing |

---

## Project Structure

```
backend/
├── prisma/
│   ├── migrations/          # SQL migration history
│   │   └── 20261013122941_initial_db/
│   │       └── migration.sql
│   ├── schema.prisma        # Prisma schema — models, enums, relations, indexes
│   └── seed.js              # Seeds admin user and 10 default categories
├── src/
│   ├── config/
│   │   └── prisma.config.js # Instantiates PrismaClient with the pg adapter
│   ├── controllers/         # Route handler functions
│   │   ├── admin.controller.js      # GET /admin/insights
│   │   ├── auth.controller.js       # register, login, logout, getMe
│   │   ├── budget.controller.js     # CRUD for budgets + spending calculations
│   │   ├── category.controller.js   # CRUD for categories
│   │   └── expense.controller.js    # CRUD for expenses + category summary
│   ├── generated/prisma/    # Auto-generated Prisma client — do not edit
│   ├── middlewares/
│   │   ├── isAdmin.middleware.js          # Requires ADMIN role (403 otherwise)
│   │   └── isAuthenticated.middleware.js  # Verifies JWT, attaches req.user
│   ├── routes/
│   │   ├── admin.routes.js      # /api/admin
│   │   ├── auth.routes.js       # /api/auth
│   │   ├── budget.routes.js     # /api/budgets
│   │   ├── category.routes.js   # /api/categories
│   │   └── expense.routes.js    # /api/expenses
│   ├── schemas/             # Zod validation schemas
│   │   ├── budget.schema.js
│   │   ├── category.schema.js
│   │   ├── expense.schema.js
│   │   └── user.schema.js
│   └── app.js               # Express app — middleware, routes, error handlers
├── .env.example
├── package.json
└── prisma7.config.ts        # Prisma CLI configuration (required for all Prisma commands)
```

---

## Prerequisites

- **Node.js** 22.6 or later — the `--experimental-strip-types` flag used in `dev` and `start` scripts requires Node.js 22.6+
- **npm** 9 or later
- **PostgreSQL** 14 or later

---

## Installation

```bash
# From the backend directory
npm install
```

---

## Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/retain_db` |
| `JWT_SECRET` | Yes | Secret for signing and verifying JWTs — use a long random string | `replace-with-a-long-random-secret` |
| `PORT` | No | Port the server listens on. Defaults to `3001`. | `3001` |
| `CLIENT_URL` | No | Frontend origin allowed by CORS. Defaults to `http://localhost:5173`. | `http://localhost:5173` |

> Never commit `.env` to version control. Change the default admin password after first login in any non-local environment.

---

## Available Scripts

Run all commands from the `backend/` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the server with nodemon (auto-restarts on file changes) |
| `npm start` | Start the server without nodemon |
| `npm run seed` | Seed the database with the admin user and default categories |
| `npm test` | Run the test suite once with Vitest |
| `npm run test:watch` | Run tests in watch mode |

---

## Database Setup

### 1. Create the database

Create a PostgreSQL database and set `DATABASE_URL` in `backend/.env`.

### 2. Run migrations

```bash
# Apply all pending migrations (development)
npx prisma migrate dev --config prisma7.config.ts

# Apply migrations without regenerating the client (production / CI)
npx prisma migrate deploy --config prisma7.config.ts
```

### 3. Generate the Prisma client

```bash
npx prisma generate --config prisma7.config.ts
```

The client is generated into `src/generated/prisma/` as specified in `schema.prisma`.

### 4. Seed the database

```bash
npm run seed
```

The seed script creates:

- **Admin account** — `admin@retain.app` / `Admin@1234`
- **10 default categories** — Uncategorized, Food & Dining, Transport, Housing, Healthcare, Entertainment, Shopping, Education, Savings & Investments, Other

> The `Uncategorized` category is required for the category deletion logic. Always run the seed before starting the server for the first time.

### Prisma Studio

```bash
npx prisma studio --config prisma7.config.ts
```

> All Prisma CLI commands must include `--config prisma7.config.ts`. The project uses a non-default configuration file; omitting the flag causes Prisma to look for the default path and fail.

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

Protected endpoints require:

```
Authorization: Bearer <token>
```

Tokens are returned by `POST /auth/login` and expire after 7 days.

---

### Auth — `/api/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Log in, receive a JWT | No |
| `POST` | `/auth/logout` | Server-side logout acknowledgement | Yes |
| `GET` | `/auth/me` | Return the authenticated user's profile | Yes |

**`POST /auth/register` — request body**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required, 1–100 characters |
| `email` | string | Required, valid email, stored lowercase |
| `password` | string | Required, 8–128 characters |

Responses: `201 { user }` · `400` validation error · `409` email already registered

**`POST /auth/login` — request body**

| Field | Type | Rules |
|---|---|---|
| `email` | string | Required, valid email |
| `password` | string | Required |

Responses: `200 { token, user }` · `400` validation error · `401` invalid credentials

---

### Expenses — `/api/expenses`

All endpoints require authentication. Users can only access their own expenses.

| Method | Path | Description |
|---|---|---|
| `POST` | `/expenses` | Create an expense |
| `GET` | `/expenses` | List expenses (filterable, sortable, paginated) |
| `GET` | `/expenses/summary` | Spending totals grouped by category |
| `GET` | `/expenses/:id` | Get a single expense |
| `PATCH` | `/expenses/:id` | Update an expense |
| `DELETE` | `/expenses/:id` | Delete an expense |

**`POST /expenses` — request body**

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required, 1–200 characters |
| `amount` | number | Required, positive |
| `date` | string | Required, ISO 8601, not in the future |
| `paymentMethod` | string | Required — `CASH`, `CARD`, `MOBILE_MONEY`, `BANK_TRANSFER`, or `OTHER` |
| `categoryId` | string | Required, valid UUID |
| `notes` | string | Optional, max 1000 characters |

**`GET /expenses` — query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Records per page (max 100) |
| `sortBy` | `date` \| `amount` | `date` | Sort field |
| `sortOrder` | `asc` \| `desc` | `desc` | Sort direction |
| `search` | string | — | Full-text search across `title` and `notes` |
| `categoryId` | UUID | — | Filter by category |
| `paymentMethod` | enum | — | Filter by payment method |
| `startDate` | ISO 8601 | — | Expenses on or after this date |
| `endDate` | ISO 8601 | — | Expenses on or before this date |

Response shape:

```json
{
  "expenses": [],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**`GET /expenses/summary` — query parameters**

| Parameter | Type | Description |
|---|---|---|
| `month` | ISO 8601 | Optional — restricts totals to this calendar month |

Response shape:

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

### Budgets — `/api/budgets`

All endpoints require authentication. Users can only access their own budgets.

| Method | Path | Description |
|---|---|---|
| `POST` | `/budgets` | Create a monthly budget |
| `GET` | `/budgets` | List all budgets |
| `GET` | `/budgets/month` | Get the budget for a specific month |
| `PATCH` | `/budgets/:id` | Update a budget's amount |
| `DELETE` | `/budgets/:id` | Delete a budget |

**`POST /budgets` — request body**

| Field | Type | Rules |
|---|---|---|
| `amount` | number | Required, positive |
| `month` | string | Required, ISO 8601 — normalized to the first day of the month |

Responses: `201 { budget }` · `409` budget already exists for this month

**`GET /budgets` — query parameters (all optional)**

| Parameter | Type | Description |
|---|---|---|
| `month` | ISO 8601 | Return only the budget for this month |
| `startMonth` | ISO 8601 | Return budgets from this month onwards |
| `endMonth` | ISO 8601 | Return budgets up to and including this month |

Each budget in the response includes computed fields:

| Field | Type | Description |
|---|---|---|
| `totalSpent` | string | Sum of expenses in the budget month (serialized Decimal) |
| `remaining` | string | `amount − totalSpent` (serialized Decimal) |
| `status` | string | `WITHIN` · `APPROACHING` (≥ 80%) · `OVER` (≥ 100%) |

**`GET /budgets/month`**

Requires `?month=<ISO 8601>`. Returns `404` if no budget exists for that month.

---

### Categories — `/api/categories`

Reading categories is public. Write operations require authentication and the `ADMIN` role.

| Method | Path | Description | Auth | Role |
|---|---|---|---|---|
| `GET` | `/categories` | List all categories | No | — |
| `GET` | `/categories/:id` | Get a single category | No | — |
| `POST` | `/categories` | Create a category | Yes | `ADMIN` |
| `PATCH` | `/categories/:id` | Update a category | Yes | `ADMIN` |
| `DELETE` | `/categories/:id` | Delete a category | Yes | `ADMIN` |

**`POST /categories` / `PATCH /categories/:id` — request body**

| Field | Type | Rules |
|---|---|---|
| `name` | string | Required for create, optional for update; 1–100 characters, unique |
| `description` | string | Optional, max 500 characters |

**Delete behaviour:** The `Uncategorized` category cannot be deleted. Deleting any other category reassigns all its expenses to `Uncategorized` in a single database transaction before the category record is removed.

---

### Admin — `/api/admin`

All endpoints require authentication and the `ADMIN` role.

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/insights` | Platform-wide analytics |

**`GET /admin/insights` — response**

```json
{
  "totalUsers": 12,
  "totalExpenses": 340,
  "totalExpenseValue": "18420.50",
  "expensesThisMonth": 47,
  "spendingByCategory": [],
  "topCategories": [],
  "bottomCategories": [],
  "recentExpenses": [],
  "recentUsers": []
}
```

- `spendingByCategory` — all categories with their expense count and total spending.
- `topCategories` — top 5 categories by expense count (descending).
- `bottomCategories` — bottom 5 categories by expense count (ascending).
- `recentExpenses` — last 10 expenses platform-wide, ordered by `createdAt` descending.
- `recentUsers` — last 10 registered users, ordered by `createdAt` descending.

---

## Middleware

### `isAuthenticated`

Located at `src/middlewares/isAuthenticated.middleware.js`.

Reads the `Authorization: Bearer <token>` header, verifies the JWT against `JWT_SECRET`, and attaches `{ id, role }` to `req.user`. Returns `401` if the header is missing, the token is malformed, or the token has expired.

### `isAdmin`

Located at `src/middlewares/isAdmin.middleware.js`.

Checks that `req.user.role === "ADMIN"`. Returns `403` if the user is authenticated but does not have the admin role. Must be used after `isAuthenticated`.

---

## Validation

All request bodies and query parameters are validated with Zod schemas in `src/schemas/`. Validation failures return:

```json
{
  "message": "Validation failed",
  "errors": {
    "fieldName": ["error message"]
  }
}
```

Key schema behaviours:

- **Expense date** — must be a valid ISO 8601 string and must not be in the future.
- **Budget month** — normalized to the first day of the month (UTC) before storage.
- **Pagination** — `page` and `limit` are coerced from query strings to integers; `limit` is capped at 100.
- **`startDate` / `endDate`** — validated that `startDate` is not after `endDate`.
- **`startMonth` / `endMonth`** — same cross-field validation for budget date ranges.

---

## Error Handling

The app has two global Express handlers registered at the bottom of `app.js`:

- **404 handler** — returns `{ message: "Route not found" }` for any unmatched route.
- **Error handler** — catches errors forwarded via `next(err)`. Returns `err.status` (or `500`) and `err.message` (or `"Internal server error"`).

Prisma unique constraint violations (`P2002`) are caught in the relevant controllers and returned as `409 Conflict` responses.

---

## Testing

The project uses Vitest with Supertest for HTTP integration tests.

```bash
# Run tests once
npm test

# Run in watch mode
npm run test:watch
```

Vitest is configured directly in `package.json`:

```json
"vitest": {
  "environment": "node",
  "testTimeout": 15000,
  "hookTimeout": 15000
}
```

---

## Security

- **Helmet** — sets standard HTTP security headers on every response.
- **CORS** — restricts allowed origins to `CLIENT_URL` (defaults to `http://localhost:5173`). Allowed methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`.
- **Rate limiting** — the `/api/auth` router applies a rate limiter (100 requests per 5-minute window per IP) to mitigate brute-force attacks on login and register.
- **Password hashing** — bcrypt with a cost factor of 12.
- **JWT** — signed with `JWT_SECRET`, 7-day expiry. The payload contains only `{ sub: userId, role }`. The secret is never exposed in responses.
- **Ownership enforcement** — every expense and budget controller verifies that the record's `userId` matches `req.user.id` before allowing read, update, or delete operations.
