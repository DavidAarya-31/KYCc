# KYCc

A web app to track credit card milestones, monthly spends, and manage your cards securely using Supabase as the backend.

## Features
- Add and manage credit cards
- Track monthly spends per card
- Secure authentication with Supabase
- Responsive UI with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd KYCc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory and add:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Set up Supabase database:**
   - Create a fresh Supabase project.
   - Run `npm run init:new-project` to regenerate `supabase/bootstrap.sql` from the current migrations.
   - Paste `supabase/bootstrap.sql` into the Supabase SQL editor, or push the migrations with the Supabase CLI.
   - Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to point at the new project.

## Cycle and History Behavior

- Card milestone spend recalculates from the active anniversary cycle and refreshes when the local date changes.
- Card detail includes a cycle-year selector so you can inspect prior anniversary cycles without changing the stored data.
- The finance screen includes a year dropdown so transactions, budgets, and insights can be viewed against past years.

## Supabase SQL Schema

The full bootstrap SQL lives in `supabase/bootstrap.sql`.

## License

MIT 
