import sys
import os
from collections import defaultdict

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client

def main():
    try:
        supabase = get_supabase_client()
        
        # Fetch all cities
        cities_res = supabase.table("cities").select("*").execute()
        cities = cities_res.data or []
        
        # Fetch all unique city slugs that have price rows
        # Since the database might have a lot of rows, we can just select city_slug from fuel_prices
        # but to prevent fetching too much data, we can query distinct city_slugs by using select with count or grouping
        # Or we can just query the last_scraped_at for all cities. If last_scraped_at is not null, it was scraped!
        # Wait, if last_scraped_at is not null, did it succeed?
        # Let's count how many cities have at least one record in fuel_prices.
        
        prices_res = supabase.table("fuel_prices").select("city_slug").execute()
        scraped_slugs = set(row['city_slug'] for row in (prices_res.data or []))
        
        state_total = defaultdict(int)
        state_scraped = defaultdict(int)
        
        for city in cities:
            state = city['state']
            slug = city['slug']
            state_total[state] += 1
            if slug in scraped_slugs:
                state_scraped[state] += 1
                
        print("=== DATABASE COVERAGE BY STATE ===")
        for state in sorted(state_total.keys()):
            total = state_total[state]
            scraped = state_scraped[state]
            pct = (scraped / total) * 100
            print(f"  {state}: {scraped}/{total} cities scraped ({pct:.1f}%)")
            
        print(f"\nTotal cities in DB: {len(cities)}")
        print(f"Total unique cities with prices: {len(scraped_slugs)}")
        
    except Exception as e:
        print("Error checking coverage:", e)

if __name__ == "__main__":
    main()
