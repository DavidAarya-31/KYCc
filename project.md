# KYCc Project Documentation

## 1. Project Overview

KYCc is a web application for tracking credit card milestone progress and personal finance activity. The project is built as a React single-page application with Supabase as the backend for authentication, database storage, and row-level security.

The app has two major functional areas:

1. Credit card milestone tracking
   - Add, edit, view, and delete credit cards.
   - Track annual milestone targets per card.
   - Record month-wise spending for each card.
   - Calculate current anniversary-cycle progress.
   - Show total milestones, total spending, total remaining amount, and total card limit across all cards.

2. Finance and budget management
   - Create and manage budgets by category.
   - Record income and expense transactions.
   - Categorize transactions.
   - Track budget utilization and status.
   - Import transactions from CSV.
   - Extract transaction details from receipt photos using local browser OCR and a review-before-import flow.
   - View spending insights with charts.

The app is designed for authenticated users. Most data is tied to the currently signed-in Supabase user and protected with Supabase row-level security policies.

## Current Status

- Phase 0 audit findings have been acted on.
- Phase 1 functional fixes are complete in the codebase: cycle reset handling, cycle summary alignment, dashboard route fix, CSV import mapping fix, finance typing cleanup, and automatic default categories for new users.
- The app now supports a fresh Supabase project bootstrap path through `npm run init:new-project` and `supabase/bootstrap.sql`.
- Phase 2 is now privacy-first and local: receipt/photo imports use browser OCR plus a review table, with no cloud AI in the extraction path.
- Phase 3 core AI features are fully implemented, utilizing a unified Supabase edge function (`ai-advisor`) integrated with the Gemini 2.5 Flash SDK to handle Advisor Chat, Smart Card Recommendations, Auto-Categorization, and Spending Anomaly Detection while preserving local context and avoiding dynamic SQL injection risks.
- AI Edge Functions are hardened with Authentication checks and Rate Limiting (tracked in `ai_usage` table).
- Phase 4 Scaling is complete: Implemented React Query for robust caching, Sentry for error tracking, React Lazy/Suspense for code splitting, and Error Boundaries for stability. Database has been hardened with indexes and RLS policies.
- **Discover Section (Phase 1: Foundation)** is complete: Implemented schema tables for a read-only card catalog directory, API query helpers, typings, and registered 18 sub-routes. Added a hoverable **🧭 Discover** navigation dropdown on desktop and structured links on mobile.
- **Discover Section (Phase 2: Card Catalog Pages & Tools)** is complete: Fully implemented Explore directory, ExploreCardDetail summary layouts, active Offers grids, ArticleDetail review contents, Rewards Calculators, live Camera/Upload UPI QR Scanner with MCC detection, and client-side Gift Card / Voucher OCR Extractor.
- **CaptainTorch Full Scraper Pipeline** is complete: Built robust DOM inspection, multi-category scraping (`cards`, `articles`, `offers`, `merchants`, `mcc`, `guides`, `hotels`, `airlines`, `lifestyle`), JSON data transformation, and Supabase ingestion scripts (`npm run scrape all`).
- **Mobile Navigation & Profile Upgrades** are complete: Implemented fixed bottom nav bar on mobile viewports (<768px), added profile dialog to manage user full name stored in Supabase Auth metadata, and added custom horizontal scrolling sub-navigation strip for mobile discover subpages.
- **Mobile Layout & Responsiveness Fixes** are complete: Upgraded the Finances page's transactions toolbar and month picker selector to stack and wrap responsively on mobile, eliminating layout squishing, clutter, and edge overflows.
- Dark mode is being expanded across remaining light-only surfaces.

### Cycle and history behavior

- Credit card cycle spending is recomputed from the active anniversary window and refreshes when the local date changes.
- Card detail includes a year selector so older anniversary cycles can be loaded without changing stored data.
- The finance page includes a month dropdown that filters budgets and insights to the selected month, while the Transactions tab displays the complete all-time transaction history.
- The dashboard includes a month dropdown for the 'Overview of Finances' section, allowing for a month-wise visualization of budget progress and spending.

## 2. Tech Stack

### Frontend

- React 18
- TypeScript
- Vite (with manual chunk optimization)
- React Router DOM
- Tailwind CSS
- Lucide React icons
- Recharts for finance charts
- `@tanstack/react-query` for data fetching, caching, and state management
- `@sentry/react` for application monitoring and error tracking
- React Lazy and Suspense for code splitting
- `react-markdown` for rendering review articles in markdown format

### Backend and Data

- Supabase Auth for email/password authentication
- Supabase Postgres database
- Supabase Row Level Security for per-user data isolation
- Supabase JavaScript client for browser-side database access

### Import and OCR

- PapaParse for CSV parsing
- Tesseract.js for browser-side OCR from uploaded receipt images

### Tooling

- ESLint
- TypeScript strict mode
- PostCSS
- Autoprefixer
- Vercel rewrite configuration for SPA routing
- `scripts/init-new-project.mjs` for regenerating a Supabase bootstrap SQL bundle from the checked-in migrations

## 3. What's Left

The remaining roadmap is primarily about maintenance and refinement:

- Phase 2: continue tightening the local OCR import flow and transaction review UX.
- Phase 3: **COMPLETED** (Auto-categorization, Smart Card recommendations in header, Spending Anomaly Detection, Dedicated Advisor Chat via JSON-serialization, Edge Function Auth/Rate Limiting).
- Phase 4: **COMPLETED** (Scaling: React Query, Sentry, Vite Bundle Optimization, Error Boundaries, DB Indexes).

Any additional UI polish or accessibility cleanup can be tracked alongside those phases.

## 4. Project Structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.ts
|-- tailwind.config.js
|-- postcss.config.js
|-- eslint.config.js
|-- vercel.json
|-- public/
|   |-- kyc-logo.png
|-- scripts/
|   |-- init-new-project.mjs
|   |-- verify-cycles.mjs
|-- supabase/
|   |-- bootstrap.sql
|   |-- migrations/
|   |   |-- 20260619000100_default_categories_for_new_users.sql
|   |   |-- 20250626094643_humble_coast.sql
|   |   |-- 20240701_budget_management.sql
|   |   |-- 20240702_add_payment_method_to_transactions.sql
|-- src/
|   |-- main.tsx
|   |-- App.tsx
|   |-- index.css
|   |-- lib/
|   |   |-- supabase.ts
|   |-- contexts/
|   |   |-- AuthContext.tsx
|   |   |-- BudgetContext.tsx
|   |   |-- ThemeContext.tsx
|   |-- pages/
|   |   |-- Auth.tsx
|   |   |-- Dashboard.tsx
|   |   |-- Cards.tsx
|   |   |-- NewCard.tsx
|   |   |-- EditCard.tsx
|   |   |-- CardDetail.tsx
|   |   |-- Finances.tsx
|   |   |-- Budgets.tsx
|   |-- components/
|   |   |-- Layout.tsx
|   |   |-- ProtectedRoute.tsx
|   |   |-- PageHeader.tsx
|   |   |-- DashboardSummary.tsx
|   |   |-- CardTile.tsx
|   |   |-- CardHeader.tsx
|   |   |-- CycleSummary.tsx
|   |   |-- MonthlySpendTable.tsx
|   |   |-- InsightsSection.tsx
|   |   |-- BudgetList.tsx
|   |   |-- BudgetForm.tsx
|   |   |-- BudgetDashboard.tsx
|   |   |-- BudgetDetail.tsx
|   |   |-- BudgetReport.tsx
|   |   |-- CategoryManager.tsx
|   |   |-- NotificationBanner.tsx
|   |   |-- TransactionForm.tsx
|   |   |-- TransactionList.tsx
|   |-- utils/
|   |   |-- cycles.ts
|   |   |-- budget.ts
|-- supabase/
|   |-- migrations/
|   |   |-- 20250626094643_humble_coast.sql
|   |   |-- 20240701_budget_management.sql
|   |   |-- 20240702_add_payment_method_to_transactions.sql
```

## 4. Application Entry Flow

### `src/main.tsx`

This is the browser entry point. It mounts the React app into the `#root` element from `index.html`.

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### `src/App.tsx`

`App.tsx` wires together global providers and routes.

Provider order:

1. `ThemeProvider`
2. `AuthProvider`
3. `BudgetProvider`
4. `BrowserRouter`

Configured routes:

| Route | Component | Access |
|---|---|---|
| `/auth` | `Auth` | Public |
| `/` | `Dashboard` inside `Layout` | Protected |
| `/cards` | `Cards` | Protected |
| `/cards/new` | `NewCard` | Protected |
| `/cards/:id` | `CardDetail` | Protected |
| `/cards/:id/edit` | `EditCard` | Protected |
| `/finances` | `Finances` | Protected |
| `/advisor` | `Advisor` | Protected |
| `/discover/*` | Discover section sub-routes (Explore, Offers, Guides, Tools) | Protected |
| `*` | Redirects to `/` | Public fallback |

The `Budgets` page exists in `src/pages/Budgets.tsx`, but it is not currently registered as a route in `App.tsx`.

## 5. Authentication Implementation

### Files

- `src/contexts/AuthContext.tsx`
- `src/pages/Auth.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/lib/supabase.ts`

### How authentication works

`AuthContext` owns the current Supabase session and user state.

It provides:

- `user`
- `session`
- `loading`
- `signUp(email, password)`
- `signIn(email, password)`
- `signOut()`

On mount, it calls:

- `supabase.auth.getSession()` to load an existing browser session.
- `supabase.auth.onAuthStateChange()` to react to sign-in, sign-out, and session changes.

`ProtectedRoute` checks the auth state:

- If auth is loading, it shows a spinner.
- If there is no user, it redirects to `/auth`.
- If there is a user, it renders protected content.

### Auth screen

`Auth.tsx` supports both sign-in and sign-up.

Implemented UI behavior:

- Email/password form.
- Sign-in/sign-up mode toggle.
- Password visibility toggle.
- Loading state during auth submission.
- Error display.
- Dark mode toggle on the auth page.
- Redirect to `/` if the user is already authenticated.

Supabase signup currently displays an alert telling the user to verify their email before logging in.

## 6. Supabase Client

### File

- `src/lib/supabase.ts`

The Supabase client reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If either variable is missing, the app throws an error at startup.

The file also defines TypeScript table types for:

- `cards`
- `monthly_spends`

The finance tables are used through helper functions in `src/utils/budget.ts`, but their TypeScript types are not fully modeled in `src/lib/supabase.ts`.

Do not commit real private credentials. The Supabase anon key is intended for browser usage, but the project should still avoid documenting or hardcoding environment-specific values outside `.env`.

## 7. Theme Implementation

### File

- `src/contexts/ThemeContext.tsx`

The app supports light and dark themes using Tailwind's class-based dark mode.

How it works:

- The theme is stored in `localStorage` as `theme`.
- On first load, the provider checks saved preference.
- If no saved preference exists, it uses `prefers-color-scheme`.
- Dark mode is enabled by adding the `dark` class to `document.documentElement`.
- `toggleTheme()` switches between `light` and `dark`.

Tailwind is configured with:

```js
darkMode: 'class'
```

## 8. Layout and Navigation

### File

- `src/components/Layout.tsx`

The layout component wraps all authenticated pages.

Implemented features:

- Top navigation bar.
- KYCc logo from `public/kyc-logo.png`.
- Desktop navigation links.
- Mobile navigation menu.
- Current user email display.
- Sign out button.
- Theme toggle button.
- Protected page rendering through React Router's `<Outlet />`.

Navigation links:

- Dashboard
- Cards
- Finances

Implementation note: the desktop Dashboard nav link points to `/dashboard`, but the router defines the dashboard at `/`. The mobile dashboard link points to `/`, which matches the actual route.

## 9. Credit Card Milestone Tracking

### Database tables

Defined in `supabase/migrations/20250626094643_humble_coast.sql`.

#### `cards`

Stores the user's credit cards.

Main fields:

- `id`
- `user_id`
- `card_company`
- `card_name`
- `card_network`
- `anniversary_month`
- `billing_date`
- `due_date`
- `annual_fee`
- `milestone_amount`
- `card_limit`
- `created_at`

Money values in this table are stored as integer cents/paise-style units. The UI accepts rupee values and converts them by multiplying by 100 before saving.

#### `monthly_spends`

Stores month-wise card spend.

Main fields:

- `id`
- `card_id`
- `month`
- `year`
- `amount_spent`

There is a unique constraint on:

```sql
(card_id, month, year)
```

This allows the UI to upsert a single spend value for a card/month/year combination.

### Card cycle logic

### File

- `src/utils/cycles.ts`

The key helper is `getAnniversaryCycle(anniversaryMonth)`.

It calculates a 12-month cycle based on the card's anniversary month and the current date.

Example behavior:

- If the current month is after or equal to the anniversary month, the cycle starts in the current year.
- If the current month is before the anniversary month, the cycle starts in the previous year.
- It returns:
  - `startMonth`
  - `endMonth`
  - `months`, an array of `YYYY-MM` strings

Other helpers:

- `formatCurrency(amountInCents)` formats integer money values as INR.
- `formatMonth(monthStr)` converts `YYYY-MM` to a readable month/year label.
- `getProgressPercentage(spent, milestone)` calculates capped milestone progress.

### Cards page

### File

- `src/pages/Cards.tsx`

The Cards page:

- Fetches all cards for the current user.
- Calculates current-cycle spending for each card.
- Displays card tiles in a responsive grid.
- Provides empty state when no cards exist.
- Links to the new-card flow.

For every card, it:

1. Calls `getAnniversaryCycle(card.anniversary_month)`.
2. Queries `monthly_spends` for the returned cycle months.
3. Reduces `amount_spent` values into `totalSpent`.
4. Passes the data into `CardTile`.

### Add card flow

### File

- `src/pages/NewCard.tsx`

The Add New Card form collects:

- Card company
- Card name
- Card network
- Anniversary month
- Billing date
- Due date
- Annual fee
- Milestone amount
- Card limit

On submit:

- It inserts a new row into `cards`.
- It attaches `user_id` from the authenticated user.
- It converts annual fee, milestone amount, and card limit from rupees to integer storage units by multiplying by 100.
- It navigates back to `/cards`.

Supported card networks:

- Visa
- Mastercard
- American Express
- RuPay
- Diners Club

### Edit card flow

### File

- `src/pages/EditCard.tsx`

The edit page:

- Fetches the card by `id` and `user_id`.
- Converts stored integer money values back to rupees for display.
- Saves updates back to Supabase.
- Navigates to the card detail page after saving.

### Card detail page

### File

- `src/pages/CardDetail.tsx`

The detail page:

- Fetches one card by route `id` and current `user_id`.
- Calculates current-cycle total spending.
- Shows card metadata through `CardHeader`.
- Shows cycle progress through `CycleSummary`.
- Shows editable monthly spend rows through `MonthlySpendTable`.
- Supports card editing and deletion.

### Card display components

#### `CardTile.tsx`

Displays a card summary with:

- Card name, company, and network.
- Card limit if present.
- Milestone value.
- Current-cycle spending.
- Progress bar.
- Remaining milestone amount.
- Urgency warning when the cycle ends within 60 days.
- Completed milestone state.

It also exports `CardTileCompact`, used by the dashboard's "Your Cards" section.

#### `CardHeader.tsx`

Displays full card metadata:

- Card name/company/network.
- Anniversary month.
- Billing date.
- Due date.
- Annual fee.
- Milestone.
- Card limit.
- Created date.

It also provides edit and delete action buttons. Delete opens a confirmation modal before calling the parent delete handler.

#### `MonthlySpendTable.tsx`

Displays all months in the current anniversary cycle.

Implemented behavior:

- Fetches existing spends for the current card and cycle.
- Shows each cycle month.
- Marks past months.
- Lets the user edit spend inline.
- Saves on Enter, blur, or save button.
- Cancels on Escape or cancel button.
- Uses Supabase `upsert` with `onConflict: 'card_id,month,year'`.
- Calls `onSpendUpdate()` after saving so parent stats refresh.

## 10. Dashboard

### File

- `src/pages/Dashboard.tsx`

The dashboard combines finance and card summaries:

1. `OverviewSection` from `Finances.tsx`
2. `CardsOverview` from `DashboardSummary.tsx`
3. `YourCards` from `DashboardSummary.tsx`

### Card dashboard summary

### File

- `src/components/DashboardSummary.tsx`

`CardsOverview` calculates:

- Total milestone across all cards.
- Total spent in the current cycle across all cards.
- Total remaining milestone amount.
- Total card limit.

It also builds a small custom SVG pie chart showing card spending distribution. The chart:

- Uses each card's current-cycle spending.
- Computes percentage by total spent.
- Highlights the highest-spend card.
- Shows a hover tooltip.

`YourCards` displays compact card rows with progress bars.

### Finance overview summary

### Source

- `OverviewSection` exported from `src/pages/Finances.tsx`

It calculates:

- Total budget
- Total spent
- Remaining amount
- Number of budget alerts
- Overall progress percentage
- Count of budgets that are on track, approaching, or over budget

## 11. Finance and Budget Management

### Database tables

Defined in `supabase/migrations/20240701_budget_management.sql`.

#### `budgets`

Stores user budgets.

Fields:

- `id`
- `user_id`
- `name`
- `total_amount`
- `period_type`
- `start_date`
- `end_date`
- `created_at`
- `updated_at`

`period_type` can be:

- `monthly`
- `weekly`
- `custom`

#### `categories`

Stores transaction/budget categories.

Fields:

- `id`
- `user_id`
- `name`
- `icon`
- `color`
- `is_default`

Default categories inserted by the migration:

- Other
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Utilities
- Healthcare
- Education
- Travel
- Housing
- Insurance
- Personal Care

#### `budget_categories`

Stores category allocations for budgets.

Fields:

- `id`
- `budget_id`
- `category_id`
- `allocated_amount`

#### `transactions`

Stores income and expense transactions.

Fields:

- `id`
- `user_id`
- `budget_id`
- `category_id`
- `amount`
- `description`
- `date`
- `type`
- `created_at`

`type` can be:

- `expense`
- `income`

#### `audit_logs`

Defines a table for user audit logs.

Fields:

- `id`
- `user_id`
- `action`
- `entity`
- `entity_id`
- `details`
- `created_at`

The current frontend does not actively write audit logs.

### Payment method migration

Defined in `supabase/migrations/20240702_add_payment_method_to_transactions.sql`.

Adds to `transactions`:

- `payment_method`
- `card_id`

Supported `payment_method` values:

- `credit_card`
- `upi`
- `cash`
- `debit_card`

`card_id` references `cards(id)`.

The migration includes a commented optional constraint for requiring `card_id` only when payment method is `credit_card`.

### Budget API helpers

### File

- `src/utils/budget.ts`

This file provides Supabase CRUD wrappers for:

- Budgets
- Categories
- Budget categories
- Transactions

Implemented functions:

- `fetchBudgets`
- `createBudget`
- `updateBudget`
- `deleteBudget`
- `fetchCategories`
- `createCategory`
- `updateCategory`
- `deleteCategory`
- `fetchBudgetCategories`
- `createBudgetCategory`
- `updateBudgetCategory`
- `deleteBudgetCategory`
- `fetchTransactions`
- `createTransaction`
- `updateTransaction`
- `deleteTransaction`

These helpers return Supabase responses directly. We have also transitioned to using `@tanstack/react-query` hooks (`useBudgets`, `useTransactions`, `usePagination`) for caching, automatic background refetching, and better loading state management across the application. State management for specific isolated workflows still runs through `BudgetContext` or local component state.

### Budget context

### File

- `src/contexts/BudgetContext.tsx`

`BudgetContext` holds global finance state:

- `budgets`
- `categories`
- `transactions`
- `budgetCategories`
- `loading`
- `error`

It exposes actions for:

- Adding, editing, and removing budgets.
- Adding, editing, and removing categories.
- Adding, editing, and removing transactions.
- Loading and modifying budget/category allocation records.

On mount, it fetches budgets, categories, and transactions in parallel.

When creating budgets and transactions, it attaches the current `user.id` before inserting.

### Finances page

### File

- `src/pages/Finances.tsx`

The `Finances` page is the main implemented finance screen. It has three tabs:

- Budgets
- Transactions
- Insights

#### Budgets tab

The Budgets tab displays budget cards.

Each budget card shows:

- Budget name
- Period type
- Budget amount
- Spent amount
- Remaining amount
- Percentage used
- Status badge

Budget status logic:

- `On Track`: spent is below 80% of the budget.
- `Approaching`: spent is at least 80% but below 100%.
- `Over Budget`: spent is greater than or equal to the budget.

Spent amount is calculated by matching transactions to the budget's `category_id`.

The tab also provides:

- Create budget modal.
- Edit budget modal.
- Delete budget action.

#### Transaction tab

The Transactions tab provides a transaction history and transaction actions.

Implemented features:

- Add transaction.
- Edit transaction.
- Delete transaction.
- Bulk select transactions.
- Bulk delete selected transactions.
- Search transactions by description, category name, or amount.
- Notification banner after bulk delete.
- Per-transaction action menu.

Transaction form fields:

- Amount
- Type: expense or income
- Category
- Date
- Paid by: credit card, UPI, cash, debit card
- Credit card selector when `Paid by` is credit card
- Note

When credit card payment is selected, the form fetches the current user's cards and displays them in a dropdown.

#### Import modal

The import modal supports two modes:

1. CSV import
2. Photo import

CSV import uses PapaParse and has three steps:

1. Upload CSV file.
2. Map CSV columns to transaction fields.
3. Preview and import cleaned rows.

Imported rows are currently normalized to:

- Category: `Other`
- Description: `Imported Transaction`
- Type: `expense`

Photo import uses Tesseract.js.

Photo flow:

1. User uploads an image.
2. Image preview is shown.
3. OCR extracts text.
4. Regex attempts to extract amount and date.
5. Extracted values prefill the transaction modal.
6. A warning appears if the extracted amount looks unusually large.

#### Insights tab

The Insights tab renders `InsightsSection`.

## 12. Insights and Charts

### File

- `src/components/InsightsSection.tsx`

The insights section uses Recharts.

Implemented charts:

1. Spending Trends
   - Groups expense transactions by month.
   - Displays a line chart.

2. Category Breakdown
   - Groups expense transactions by category name.
   - Displays a pie chart with legend and tooltip.

The file also includes helper functions for:

- Budget vs actual by category.
- Forecasting based on recent spending trends.
- Milestone progress by budget.

Not all helper functions are currently rendered in the UI.

## 13. Additional Components

### `CategoryManager.tsx`

Displays available categories from `BudgetContext`.

It handles:

- Loading state.
- Error state.
- Empty state.

It is not currently mounted in the main routed UI.

### `BudgetList.tsx` and `BudgetForm.tsx`

These provide an alternate budget list and form implementation.

They are used by `src/pages/Budgets.tsx`, but that page is not registered in the router.

### Placeholder components

The following components currently contain placeholder UI:

- `BudgetDashboard.tsx`
- `BudgetDetail.tsx`
- `BudgetReport.tsx`
- `TransactionForm.tsx`
- `TransactionList.tsx`

They indicate planned feature areas but are not currently central to the routed app.

### `NotificationBanner.tsx`

A small reusable banner for success, error, and info messages.

It is currently used after bulk transaction deletion.

## 14. Styling

### Tailwind CSS

Tailwind is configured in `tailwind.config.js`.

Content paths:

```js
['./index.html', './src/**/*.{js,ts,jsx,tsx}']
```

Dark mode:

```js
darkMode: 'class'
```

### Global CSS

### File

- `src/index.css`

It includes Tailwind layers:

- `@tailwind base`
- `@tailwind components`
- `@tailwind utilities`

It also hides scrollbars globally while keeping scrolling enabled and prevents horizontal overflow on the page.

## 15. Security Model

The Supabase migrations enable Row Level Security on all main tables.

Protected tables:

- `cards`
- `monthly_spends`
- `budgets`
- `categories`
- `budget_categories`
- `transactions`
- `audit_logs`

The policies generally follow this model:

- A user can read only rows tied to their own `user_id`.
- A user can insert only rows where `user_id = auth.uid()`.
- A user can update only their own rows.
- A user can delete only their own rows.

For child tables without direct `user_id`, such as `monthly_spends` and `budget_categories`, access is checked through the parent table:

- `monthly_spends` access is allowed only if the related card belongs to the current user.
- `budget_categories` access is allowed only if the related budget belongs to the current user.

## 16. Deployment Configuration

### Vite

`vite.config.ts` enables the React plugin and excludes `lucide-react` from dependency optimization.

### Vercel

`vercel.json` rewrites all routes to `/`.

This is needed because the app uses browser-side routing. Without the rewrite, directly opening routes like `/cards` or `/finances` on Vercel could return a 404.

## 17. Setup and Running Locally

### Prerequisites

- Node.js
- npm
- Supabase project

### Install dependencies

```bash
npm install
```

### Configure environment

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Apply database migrations

Run the SQL files in `supabase/migrations` against the Supabase project:

1. `20250626094643_humble_coast.sql`
2. `20240701_budget_management.sql`
3. `20240702_add_payment_method_to_transactions.sql`

The payment-method migration depends on both `transactions` and `cards`, so it should be applied after those tables exist.

### Start development server

```bash
npm run dev
```

### Build production bundle

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## 18. Important Implementation Notes and Current Gaps

These are factual observations from the current codebase.

### Routing mismatch

The desktop navigation link for Dashboard points to `/dashboard`, but `App.tsx` only defines the dashboard at `/`.

### Unused routed page

`src/pages/Budgets.tsx` exists but is not currently routed.

### Placeholder components

Several finance-related component files are placeholders or alternate implementations and are not part of the active routed workflow.

### `CycleSummary` prop mismatch

`CardDetail.tsx` calls `CycleSummary` with:

```tsx
<CycleSummary
  milestone={card.milestone_amount}
  spent={stats.totalSpent}
  cycleEndMonth={...}
/>
```

But `CycleSummary.tsx` currently expects:

```tsx
{ card, spent, cycle, remaining, progress, isUrgent, endDate }
```

This mismatch will need correction for strict TypeScript/build compatibility and for the card detail page to render correctly.

### Finance table types are not modeled in `Database`

`src/lib/supabase.ts` only defines typed table metadata for `cards` and `monthly_spends`. Finance helpers use `any`, so budget and transaction operations have weaker compile-time safety.

### Default categories are inserted only during migration

The budget migration inserts default categories for users existing at migration time. New users created later may not automatically receive these categories unless additional onboarding logic or database triggers are added.

### CSV import mapping needs review

The CSV mapping UI is implemented, but the mapping object shape appears inconsistent with how preview values are read. This may need testing and correction before relying on CSV import in production.

### Audit logs are not used by the frontend

The `audit_logs` table and policies exist, but the React app does not currently write audit log records.

### OCR parsing is heuristic

Receipt OCR uses Tesseract.js plus simple regex extraction for amount and date. This is useful for a first pass but may require manual correction by the user.

### No automated tests are currently configured

`package.json` includes scripts for dev, build, lint, and preview, but no test script.

### Edge Function Configuration

AI Edge Functions require deployment to Supabase with proper secrets. They now implement rate-limiting via the `check_ai_rate_limit` RPC call which relies on the `ai_usage` table.

## 19. Feature Summary

Implemented user-facing features:

- Supabase email/password authentication.
- Protected app routes.
- Light/dark theme toggle.
- Responsive layout with desktop and mobile navigation.
- Credit card creation.
- Credit card editing.
- Credit card deletion with confirmation.
- Credit card list view.
- Card detail view.
- Month-wise card spend editing.
- Anniversary-cycle spend calculation.
- Credit card milestone progress.
- Dashboard card totals.
- Dashboard finance overview.
- Budget creation and editing.
- Budget deletion.
- Budget cards with utilization progress.
- Transaction creation and editing.
- Transaction deletion.
- Bulk transaction deletion.
- Transaction search.
- Payment method selection.
- Credit-card linking for transactions paid by credit card.
- CSV import flow.
- Receipt/photo OCR import flow.
- Spending trend chart.
- Category breakdown chart.
- Read-only Discover catalog section featuring Explore (Card Catalog), Offers, Guides, and Tools.
- Hoverable Discover navigation dropdown for desktop and structured drawer sections for mobile.

Partially implemented or present but not fully wired:

- Separate `Budgets` page route.
- Audit logging.
- Budget allocation detail UI.
- Forecasting and budget-vs-actual chart helpers.
- Placeholder budget and transaction components.

## 20. High-Level Data Flow

### Authenticated app load

1. `main.tsx` mounts `App`.
2. `ThemeProvider` applies saved/system theme.
3. `AuthProvider` loads Supabase session.
4. `BudgetProvider` fetches budgets, categories, and transactions.
5. `ProtectedRoute` either redirects to `/auth` or renders `Layout`.
6. `Layout` renders the active route through `<Outlet />`.

### Card milestone flow

1. User creates a card.
2. Card is saved to `cards`.
3. User opens the card detail page.
4. App calculates current anniversary cycle.
5. App fetches `monthly_spends` for that cycle.
6. User edits monthly spend.
7. App upserts spend into `monthly_spends`.
8. Parent stats recalculate total spent and milestone progress.

### Finance flow

1. `BudgetProvider` fetches budgets, categories, and transactions.
2. `Finances` renders tab UI.
3. Budget tab derives spent amounts from transactions by category.
4. Transaction tab creates/updates/deletes records through `BudgetContext`.
5. Insights tab groups transactions into chart-friendly datasets.
6. Recharts renders spending trends and category breakdowns.

## 21. Summary

KYCc is a React + Supabase personal finance app focused on credit card milestone tracking and budget-aware expense management. The strongest implemented areas are authentication, card CRUD, monthly spend tracking, dashboard summaries, budget cards, transaction history, CSV/photo import workflows, and basic spending analytics.

The project also contains several planned or partially wired pieces, especially around standalone budget pages, budget reports, audit logs, and richer insights. Before production use, the most important technical cleanup items are the `CycleSummary` prop mismatch, the dashboard route mismatch, finance table typing, default-category onboarding for new users, and CSV import verification.
