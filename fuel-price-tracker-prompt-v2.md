# Fuel Price Tracker — Final AI Prompt + Project Structure
### (Next.js + Supabase + Python scraper, sab ek hi Vercel project mein)

## 🎯 Prompt (AI ko yeh copy-paste karke do)

```
I want to build a production-level Fuel Price Tracker website for India using this exact 
stack, deployed as a single Vercel project:

- Frontend: Next.js (App Router) with Tailwind CSS
- Database: Supabase (Postgres) — frontend will query Supabase directly using the 
  Supabase JS client, no separate backend API needed
- Scraper: Python, running as a Vercel Serverless Function (inside the same Next.js 
  project's /api folder), triggered daily by Vercel Cron Jobs
- Deployment: Everything on Vercel (Hobby plan)

Requirements:

1. Supabase setup:
   - Table `cities`: slug (text, primary key), name (text), state (text)
   - Table `fuel_prices`: id (auto), city_slug (text, foreign key to cities.slug), 
     date (date), petrol_price (numeric), diesel_price (numeric), 
     scraped_at (timestamp default now())

2. Python scraper (as a Vercel serverless function at /api/scrape.py):
   - Fetches https://www.cardekho.com/fuel-price-in-{city-slug}-city for each city
   - Extracts the `window.__INITIAL_STATE__ = {...};` JSON object embedded in the page's 
     <script> tag using regex + json.loads() — do NOT use BeautifulSoup or Selenium
   - Pulls today's petrol/diesel price and the previous day's price (both are available 
     in the same JSON under `dateWisePriceRate`, so no extra request needed for the diff)
   - Inserts a new row into `fuel_prices` in Supabase for each city, with a small delay 
     (1-2 sec) between requests to avoid rate limiting
   - Since Vercel Hobby plan has a ~10 second function timeout, process cities in small 
     batches (e.g. 20-30 per invocation) rather than all at once — trigger multiple 
     batches if needed, or note this as a scaling consideration

3. A one-time setup script (also Python) that scrapes CarDekho's full `states` and 
   `cities` arrays (found in the same INITIAL_STATE JSON) and populates the `cities` table

4. vercel.json with a Cron Jobs configuration that triggers /api/scrape once daily at 
   6:30 AM IST (adjust for UTC offset)

5. Frontend (Next.js):
   - A dependent State dropdown → City dropdown (fetched directly from Supabase via the 
     JS client)
   - On city selection, query Supabase for that city's latest fuel_prices row AND the 
     previous day's row (ORDER BY date DESC LIMIT 2)
   - Display a clean price card: Petrol price, Diesel price, Last Updated date/time, and 
     price difference (green ▼ if price dropped, red ▲ if price rose, gray "No change" 
     if same, "N/A" if no previous day data exists)
   - Clean, professional, mobile-responsive design using Tailwind

6. Include:
   - .env.local.example with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - requirements.txt for the Python function (requests, supabase-py)
   - Basic error handling: retry logic if a scrape fails, log failures without crashing 
     the whole batch
   - A README explaining local setup, Supabase table creation, and Vercel deployment 
     (including how to add environment variables and enable Cron Jobs)

Please scaffold the folder structure first, then implement in this order: 
1) Supabase schema, 2) one-time locations scraper, 3) daily price scraper function, 
4) vercel.json cron config, 5) Next.js frontend.
```

---

## 📁 Final Project Structure

```
fuel-price-tracker/                  ← single Next.js project, deployed on Vercel
│
├── app/                             # Next.js App Router — frontend pages
│   ├── page.tsx                     # main page: state/city selector + price card
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── StateSelector.tsx
│   ├── CitySelector.tsx
│   └── PriceCard.tsx
│
├── lib/
│   └── supabaseClient.ts            # Supabase JS client (used by frontend)
│
├── api/                             # Python serverless functions (Vercel picks these up)
│   ├── scrape.py                    # daily scraper — triggered by Vercel Cron
│   └── _utils/
│       ├── extract_state.py         # regex + json.loads() helper for INITIAL_STATE
│       └── supabase_client.py       # Supabase Python client (used by scraper)
│
├── scripts/
│   └── seed_locations.py            # ONE-TIME script: scrapes states/cities, seeds DB
│
├── requirements.txt                 # requests, supabase (Python deps for /api)
├── package.json                     # Next.js deps
├── tailwind.config.ts
├── vercel.json                      # cron schedule config: 6:30 AM IST daily → /api/scrape
├── .env.local.example               # NEXT_PUBLIC_SUPABASE_URL=, NEXT_PUBLIC_SUPABASE_ANON_KEY=
├── .gitignore
└── README.md
```

---

## 📝 Quick Notes

- **No separate backend folder** — Python scraper lives inside `/api`, right alongside 
  the Next.js app, because Vercel auto-detects Python files in `/api` as serverless 
  functions.
- **`scripts/seed_locations.py`** tum sirf ek baar apne computer se manually chalaoge 
  (setup ke time) — yeh Vercel pe deploy/schedule nahi hoga.
- Supabase **anon key** frontend mein safe hai use karna (public read-only access ke 
  liye), lekin scraper (write access) ke liye Supabase **service role key** use karna — 
  use kabhi frontend/public code mein mat daalna, sirf `/api/scrape.py` ke andar 
  environment variable se.
