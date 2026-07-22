# Fuel Price Tracker 🚗💨

A production-level Fuel Price Tracker website for India showing live, daily-updated Petrol and Diesel prices across major cities in each state.

Built using:
- **Frontend:** Next.js (App Router) + Tailwind CSS (v4) + Lucide Icons + Supabase JS Client
- **Database:** Supabase (Postgres) — Frontend queries the DB directly
- **Scraper:** Standalone Python Script running as a scheduled **GitHub Actions Workflow**, bypassing Vercel Hobby timeouts to scrape all cities in a single run.

---

## 📁 Project Structure

```text
fuel-price-tracker/                  ← Next.js project & Scraper
│
├── .github/
│   └── workflows/
│       └── daily-scrape.yml         # GitHub Actions schedule & manual workflow
│
├── app/                             # Next.js App Router — frontend pages
│   ├── page.tsx                     # main page: state/city selector + price card
│   ├── layout.tsx                   # global layout with metadata / SEO
│   └── globals.css                  # global Tailwind styles & scrollbars
│
├── components/
│   ├── StateSelector.tsx            # State selection dropdown
│   ├── CitySelector.tsx             # City selection dropdown
│   └── PriceCard.tsx                # Displays fuel prices and changes
│
├── lib/
│   └── supabaseClient.ts            # Supabase JS client (used by frontend)
│
├── api/
│   └── scrape.py                    # standalone daily scraper script (run by GitHub Actions)
│
├── api/_utils/
│   ├── extract_state.py             # regex + json.loads() helper for INITIAL_STATE
│   └── supabase_client.py           # Supabase Python client (used by scraper)
│
├── scripts/
│   ├── seed_locations.py            # ONE-TIME script: scrapes states/cities & seeds DB
│   └── scrape_mp.py                 # test script: specifically scrapes MP cities
│
├── requirements.txt                 # requests, supabase (Python deps for scraper)
├── package.json                     # Next.js & UI dependencies
├── .env.local.example               # template for environment variables
├── schema.sql                       # database creation SQL commands
└── README.md
```

---

## 🛠️ Step-by-Step Setup Guide

### 1. Database Setup (Supabase)

1. Create a free project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste the contents of `schema.sql` and run it. This will:
   - Create the `cities` table to store city slugs, names, and states.
   - Create the `fuel_prices` table to store price records.
   - Set up unique indexes, constraints (preventing duplicates for the same city on the same day to support safe database upserts), and enable Row Level Security (RLS) with public read access.

### 2. Local Environment Configuration

1. Copy `.env.local.example` to `.env.local` in the root folder:
   ```bash
   cp .env.local.example .env.local
   ```
2. Retrieve your Supabase keys from the **Project Settings** → **API** dashboard in Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your `sb_publishable_...` key.
   - `SUPABASE_URL`: Your Project URL.
   - `SUPABASE_SERVICE_KEY`: Your secret `sb_secret_...` key (required by the Python scraper to write records bypass RLS).
3. The local Python scripts (`seed_locations.py` and `scrape.py`) will automatically parse and load values from `.env.local` if run on your local machine!

### 3. Install Python Dependencies & Seed Locations

1. Make sure Python (>=3.9) is installed.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the one-time seeder script to populate major cities (approx. 190+ major cities across all states to optimize scraping time):
   ```bash
   python scripts/seed_locations.py
   ```
4. Verify in your Supabase Dashboard that the `cities` table is populated!

### 4. Run & Test the Scraper Locally

To run the scraper locally and fetch prices for all cities sequentially (incorporates a 1.5-second delay between requests to avoid rate limits):
```bash
python api/scrape.py
```
*(You can stop the script at any time using `Ctrl + C` once you see it successfully logging some cities).*

### 5. Running the Frontend Locally

1. Install npm packages:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser. Choose a State and City to see the live rates and difference compared to the previous day!

---

## 🚀 GitHub Actions Scraper Schedule

Rather than running on Vercel (which has a strict 10-second timeout limit for serverless functions on the Hobby plan), the daily scraper is executed as a **scheduled GitHub Actions workflow**. This allows the scraper to run for 3-4 minutes to safely cycle through all 192 cities in one run.

### 1. Adding Secrets to GitHub

To allow the GitHub Actions runner to connect to your Supabase instance, you must configure two environment variables as repository secrets:

1. On GitHub, navigate to your project repository.
2. Go to **Settings** (tab on top) → **Secrets and variables** (left sidebar) → **Actions**.
3. Click the **New repository secret** button.
4. Add the following two secrets:
   - **`SUPABASE_URL`**: Set this to your Supabase Project URL (e.g., `https://ewadbwofpwbgaubkfste.supabase.co`).
   - **`SUPABASE_SERVICE_KEY`**: Set this to your secret Supabase service role key (starting with `sb_secret_`).
5. Click **Add secret** to save them.

### 2. How the Schedule Works
- The workflow file `.github/workflows/daily-scrape.yml` triggers the scraper automatically once daily at **6:30 AM IST (1:00 AM UTC)**.
- It spins up a temporary virtual machine, checks out your code, sets up Python, installs dependencies, loads the secret variables, and executes `python api/scrape.py`.

### 3. How to Test the Workflow Manually (Before the Schedule)

You can trigger a scraper run manually at any time to verify that your GitHub Secrets and Python configuration are working:

1. Navigate to your repository page on GitHub.
2. Click the **Actions** tab on the top menu bar.
3. In the left sidebar, click on **Daily Fuel Price Scraper** under the workflows list.
4. If `workflow_dispatch` is configured correctly (which it is!), you will see a banner that says **"This workflow has a workflow_dispatch event trigger."** and a **Run workflow** dropdown button on the right side.
5. Click **Run workflow**, select your branch (usually `main`), and click the green **Run workflow** button.
6. Refresh the page after a few seconds. You will see a new run starting. Click on it to see real-time console output as it logs into Supabase and scrapes each city!
