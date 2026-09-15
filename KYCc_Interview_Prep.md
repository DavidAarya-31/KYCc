# My KYCc Project: Interview Presentation Guide

This document is my personal script and reference guide for explaining the KYCc (Know Your Credit card) project during technical interviews. It covers the core architecture, technical decisions, and trade-offs I made while building the application.

---

## 1. Executive Overview

**The Project:** I built KYCc, a modern, privacy-first personal finance and credit card milestone tracking single-page application (SPA).
**The Problem I Solved:** Tracking complex, staggered credit card reward milestones (anniversary cycles) is difficult. I built this app to solve that problem while also providing holistic budget and transaction management, augmented by local-first privacy tooling and intelligent AI features.

### My Architectural Approach
I chose to build a thick-client React SPA communicating directly with a Backend-as-a-Service (Supabase Postgres) via secure, client-side SDK calls enforced by Row-Level Security (RLS). 
- **The Trade-off:** By putting business logic in the client and relying on Supabase for data integrity, I significantly reduced server infrastructure overhead and operational complexity. The trade-off is that I rely heavily on database RLS to prevent unauthorized access instead of a traditional custom middle-tier API validation layer.
- **AI Extension:** I broke the "thick-client only" rule strictly for AI integrations. I used Supabase Edge Functions to keep my Gemini API secrets secure and to centralize prompt management.

---

## 2. Frontend Architecture

### React 18 & TypeScript
- **My Choice:** React 18 for the UI library and TypeScript for static typing.
- **Why I Chose It:** React gave me a declarative component model perfect for dynamic financial dashboards. I used TypeScript to reduce runtime errors, improve developer experience, and model my database shapes directly on the client side.

### State Management (`src/contexts`)
- **My Approach:** React Context API (`AuthContext`, `BudgetContext`, `ThemeContext`).
- **Why I Chose It:** To avoid prop-drilling for global state like user sessions, active theme, and cached finance data (budgets/categories). I chose Context over Redux or Zustand because the global state in my app is relatively simple and mostly maps directly to database entities or user session data.
- **How I Built It:** I wrapped the application in Providers within `App.tsx`. `BudgetContext` fetches global budgets, categories, and transactions on mount, and exposes CRUD actions that interact with Supabase and optimistically update local state.

### Build Tooling: Vite
- **My Choice:** Vite for the frontend build tool and dev server.
- **Why I Chose It:** I wanted significantly faster cold starts and Hot Module Replacement (HMR) compared to Webpack or Create React App, which Vite provides out-of-the-box using native ES modules.

### Styling: Tailwind CSS
- **My Approach:** Utility-first CSS framework.
- **Why I Chose It:** It enabled rapid UI development without context-switching between TSX and CSS files. It ensured a consistent design system and made implementing features like Dark Mode trivial using the `dark` class.

### Visualization: Recharts
- **My Choice:** Recharts, a composable charting library built on React components.
- **How I Used It:** I integrated it in `InsightsSection.tsx` to group expense transactions and render Spending Trends (line charts) and Category Breakdowns (pie charts).

---

## 3. Database & Backend Architecture (Supabase)

### PostgreSQL Schema & Relational Design
- **My Approach:** A normalized relational database storing cards, transactions, budgets, categories, and monthly spends.
- **Why I Chose It:** Financial data is inherently relational (e.g., a transaction belongs to a category, a budget allocates funds to categories). Postgres provides the ACID compliance critical for this kind of financial data.

### My Optimization: Integer Cents for Financial Data
- **The Decision:** I chose to store all monetary values (`annual_fee`, `milestone_amount`, `card_limit`, `amount_spent`) as integers representing cents/paise (e.g., ₹100 is stored as 10000).
- **Why:** Floating-point math in databases and JavaScript is notoriously imprecise. Using integers completely eliminated floating-point rounding errors during financial aggregations in my app.
- **Implementation:** My frontend handles the conversion: multiplying by 100 on form submit and dividing by 100 on fetch.

### My Security Model: Row-Level Security (RLS)
- **The Approach:** I implemented Postgres RLS policies tied to the authenticated user (`user_id`).
- **Why:** Because my React client queries the database directly, the database itself must enforce authorization. Without my RLS policies, any user could query another user's data using the public anon key.
- **Implementation:** I defined policies in SQL migrations. For child tables like `monthly_spends`, the policy dynamically checks the parent table's `user_id` via a subquery.

### Backend APIs & Edge Functions
- **My Approach:** Supabase Edge Functions powered by Deno.
- **Why:** I needed a secure way to hold my external API keys (Gemini) and run sensitive backend logic without exposing it to the browser.
- **Implementation:** I unified my AI features into a single edge function endpoint. The frontend passes the prompt and local context to the function, which then orchestrates the call to the Gemini API.

---

## 4. Core Logic Implementation

### Anniversary-Cycle Calculation (`src/utils/cycles.ts`)
- **The Logic:** The `getAnniversaryCycle` utility function.
- **Why It Was Needed:** Credit card milestone tracking doesn't follow a standard calendar year; it follows a 12-month cycle starting from the month the card was issued (the anniversary month). 
- **How I Built It:** I wrote an algorithm that dynamically calculates a 12-month window based on the active card's anniversary month and the current date. It handles edge cases like year boundary wrapping (e.g., an October anniversary calculating months wrapping into the next calendar year).

### Upsert Patterns for Spend Data
- **My Pattern:** Using Supabase `upsert` operations for `monthly_spends`.
- **Why:** In the `MonthlySpendTable`, users edit their spending month-by-month. I needed a way to seamlessly insert a record if they haven't logged spend for that month yet, or update it if they have.
- **Implementation:** I placed a unique database constraint on `(card_id, month, year)`. The client uses an `upsert` call with `onConflict: 'card_id,month,year'`, preventing race conditions and duplicate entries.

---

## 5. Privacy-First Data Ingestion

### Local Browser OCR (Tesseract.js)
- **My Solution:** Client-side Optical Character Recognition using WebAssembly via Tesseract.js.
- **Why I Built It This Way:** Financial receipts contain highly sensitive data. I decided that sending images to a cloud service for extraction introduced a massive privacy vector. 
- **Implementation:** When a user uploads a receipt, I use Tesseract.js to load a worker in the browser, process the image entirely client-side, and use Regex heuristics to pull out Date and Amount fields. 
- **The Trade-off:** It is slower than cloud OCR and heuristic-based. To mitigate accuracy issues, I designed a human-in-the-loop "review before import" workflow.

### CSV Import (PapaParse)
- **My Solution:** Client-side CSV parsing.
- **Why:** Similar to my OCR approach, parsing bank statements locally ensures no financial history is ever sent to a third-party server.

---

## 6. AI Features (My Phase 3 Integration)

- **The Integration:** Advanced AI capabilities powered by Gemini 2.5 Flash.
- **Why:** I wanted to provide intelligent financial insights, automate manual data entry (categorization), and offer personalized advice.
- **How I Architected It:** 
  1. **Unified Edge Function:** I created a single Supabase Edge Function (`ai-advisor`) to handle requests, centralizing the Gemini SDK dependency and securing the API key.
  2. **Context Passing:** My React app serializes the user's necessary financial context (e.g., recent transactions, budget limits) to JSON and sends it in the payload. This prevents the Edge Function from needing to execute dynamic SQL injection risks to gather context.
- **Features I Built:**
  - **Advisor Chat:** Dedicated chat interface for financial questions.
  - **Smart Card Recommendations:** Header alerts suggesting which card to use based on current milestone progress.
  - **Auto-Categorization:** AI analyzes transaction descriptions to automatically assign the correct budget category.
  - **Spending Anomaly Detection:** Flags unusual spending patterns based on historical data context.

---

## 7. Deployment & Development Workflow

- **Deployment:** Vercel.
- **Why:** Vercel provided seamless CI/CD for my Vite/React application.
- **Routing Configuration:** I configured a `vercel.json` file with a rewrite rule `{"rewrites": [{"source": "/(.*)", "destination": "/"}]}`. This was a critical architectural requirement I implemented for SPA routing (React Router) to ensure direct navigation to URLs didn't result in a 404.

---

## 8. Known Gaps & What I'd Improve Next

When asked about technical debt or future improvements, I plan to discuss these points:

1. **`CycleSummary` Prop Mismatch:** 
   - I have a mismatch where `CardDetail.tsx` passes a smaller prop set than `CycleSummary.tsx` expects. My next step is to fix this for strict TypeScript compilation.
2. **Dashboard Routing Inconsistency:**
   - The desktop nav link points to `/dashboard`, but my router listens for `/`. I need to unify these routes.
3. **Weak Typing for Finance Tables:**
   - I generated types for `cards` but currently use `any` for my finance helpers (`budget.ts`). I plan to set up the Supabase CLI to generate strict types for transactions and budgets.
4. **New User Onboarding (Default Categories):**
   - Default categories were created via a one-time SQL script. I plan to implement a Supabase Database Trigger on `auth.users` insertion to automatically copy default categories to new users.
5. **Automated Testing:**
   - Currently, I have zero test coverage. My next major initiative is to introduce Vitest and React Testing Library, starting with pure business logic like the `getAnniversaryCycle` math and OCR regex heuristics.
