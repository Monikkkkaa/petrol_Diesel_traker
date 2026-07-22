import sys
import os
import time
import random
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client
from api._utils.extract_state import get_city_fuel_prices
from api.scrape import generate_mock_prices

def main():
    print("Initializing Supabase client for remaining cities...")
    supabase = get_supabase_client()
    
    # Query all cities that haven't been scraped yet (last_scraped_at is null)
    res = supabase.table("cities") \
        .select("slug, name, state") \
        .is_("last_scraped_at", "null") \
        .execute()
        
    cities = res.data or []
    print(f"Found {len(cities)} cities remaining to be scraped. Starting loop...")
    
    success_count = 0
    mock_count = 0
    fail_count = 0
    
    for i, city in enumerate(cities):
        slug = city['slug']
        name = city['name']
        state = city['state']
        
        # 1.5-second delay between requests
        if i > 0:
            time.sleep(1.5)
            
        print(f"({i+1}/{len(cities)}) [{state}] Scraping {name} ({slug})...")
        
        prices = None
        is_mock = False
        
        try:
            prices = get_city_fuel_prices(slug)
        except Exception as e:
            print(f"  [INFO] Cardekho scraping failed for {name}: {e}. Falling back to mock data...")
            
        if not prices:
            prices = generate_mock_prices(slug)
            is_mock = True
            
        try:
            price_rows = [
                {
                    "city_slug": slug,
                    "date": p["date"],
                    "petrol_price": p["petrol_price"],
                    "diesel_price": p["diesel_price"]
                }
                for p in prices
            ]
            supabase.table("fuel_prices").upsert(price_rows).execute()
            supabase.table("cities").update({"last_scraped_at": "now()"}).eq("slug", slug).execute()
            
            if is_mock:
                mock_count += 1
                print(f"  [OK] Success (MOCK): Upserted {len(price_rows)} mock prices.")
            else:
                success_count += 1
                print(f"  [OK] Success: Upserted {len(price_rows)} prices.")
        except Exception as db_err:
            fail_count += 1
            print(f"  [FAIL] Database Error: {db_err}")
            
    print(f"\nScraping complete! Success (LIVE): {success_count}, Populated (MOCK): {mock_count}, Failed: {fail_count}")

if __name__ == "__main__":
    main()
