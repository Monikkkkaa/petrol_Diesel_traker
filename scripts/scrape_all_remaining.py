import sys
import os
import time

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client
from api._utils.extract_state import get_city_fuel_prices

def main():
    print("Initializing Supabase client for full database scrape...")
    supabase = get_supabase_client()
    
    # Query all cities that haven't been scraped yet (last_scraped_at is null)
    res = supabase.table("cities") \
        .select("slug, name, state") \
        .is_("last_scraped_at", "null") \
        .execute()
        
    cities = res.data or []
    print(f"Found {len(cities)} cities remaining to be scraped. Starting loop...")
    
    success_count = 0
    fail_count = 0
    
    for i, city in enumerate(cities):
        slug = city['slug']
        name = city['name']
        state = city['state']
        
        # 1-second delay between requests to be respectful to Cardekho and avoid rate limits
        if i > 0:
            time.sleep(1.0)
            
        print(f"({i+1}/{len(cities)}) [{state}] Scraping {name} ({slug})...")
        try:
            prices = get_city_fuel_prices(slug)
            if prices:
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
                success_count += 1
                print(f"  [OK] Success: Upserted {len(price_rows)} prices.")
            else:
                fail_count += 1
                print(f"  [FAIL] Failed: No prices found.")
        except Exception as e:
            fail_count += 1
            print(f"  [FAIL] Failed: {e}")
            # Update last_scraped_at anyway so we don't get stuck on it in future runs
            try:
                supabase.table("cities").update({"last_scraped_at": "now()"}).eq("slug", slug).execute()
            except Exception:
                pass
            
    print(f"\nScraping complete! Success: {success_count}, Failed/Skipped: {fail_count}")

if __name__ == "__main__":
    main()
