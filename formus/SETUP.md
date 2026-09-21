# Formus Setup Guide

## Prerequisites
- Node.js (v20 or higher recommended)
- npm or yarn
- A Supabase account

## Setup Steps

### 1. Install Dependencies
```bash
cd /Users/shubhamrawat/Desktop/SYNT/formus
npm install
```

### 2. Configure Environment Variables

A `.env.local` file has been created for you. You need to add your Supabase credentials:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select or create your project
3. Go to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

5. Open `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Database Setup

Make sure your Supabase database has the required tables:
- `categories`
- `threads`
- `thread_stats`
- `profiles`
- `comments`

You may need to run database migrations or SQL scripts to set up these tables.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

- **Environment variables not loading**: Make sure the `.env.local` file is in the `formus` directory (not the parent SYNT directory)
- **Supabase connection errors**: Verify your URL and API key are correct
- **Missing tables**: Check your Supabase database structure matches the expected schema

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Important Files

- `.env.local` - Your local environment variables (DO NOT commit)
- `.env.example` - Template for environment variables (safe to commit)
- `src/lib/supabase/` - Supabase client configuration
