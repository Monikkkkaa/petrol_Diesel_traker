import os
import sys
import time

# Add root folder to sys.path to enable imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client
from api._utils.extract_state import get_city_fuel_prices

def main():
    print("=== STARTING FULL DATABASE FUEL PRICE SCRAPER ===")
    start_time = time.time()
    
    try:
        supabase = get_supabase_client()
    except Exception as e:
        print(f"Fatal Error: Failed to initialize Supabase client: {e}")
        sys.exit(1)

    # Fetch ALL cities from the cities table
    try:
        print("Fetching all cities from the database...")
        res = supabase.table("cities") \
            .select("slug, name, state") \
            .order("name", desc=False) \
            .execute()
        cities = res.data or []
    except Exception as e:
        print(f"Fatal Error: Failed to query cities table: {e}")
        sys.exit(1)

    if not cities:
        print("No cities found in the database. Please run the seeder first.")
        sys.exit(0)

    print(f"Found {len(cities)} cities in database. Commencing sequential scraping...")

    success_count = 0
    fail_count = 0

    for i, city in enumerate(cities):
        slug = city['slug']
        name = city['name']
        state = city['state']
        
        # 1.5-second delay to avoid triggering rate limit blocklist on Cardekho
        if i > 0:
            time.sleep(1.5)
            
        print(f"({i+1}/{len(cities)}) [{state}] Scraping {name} ({slug})...")
        
        try:
            # Fetch prices
            prices = get_city_fuel_prices(slug)
            
            if prices:
                # Prepare rows for upsert
                price_rows = [
                    {
                        "city_slug": slug,
                        "date": price_entry["date"],
                        "petrol_price": price_entry["petrol_price"],
                        "diesel_price": price_entry["diesel_price"]
                    }
                    for price_entry in prices
                ]
                
                # Upsert prices into Supabase
                supabase.table("fuel_prices").upsert(price_rows).execute()
                
                # Update last_scraped_at timestamp for the city
                supabase.table("cities") \
                    .update({"last_scraped_at": "now()"}) \
                    .eq("slug", slug) \
                    .execute()
                
                success_count += 1
                print(f"  [OK] Success: Upserted {len(price_rows)} prices.")
            else:
                fail_count += 1
                print("  [FAIL] Failed: No price entries extracted from state data.")
                
        except Exception as e:
            fail_count += 1
            print(f"  [FAIL] Failed: {e}")
            
            # Even if scraping fails, update last_scraped_at so we know an attempt was made
            # and to keep track of scraper coverage
            try:
                supabase.table("cities") \
                    .update({"last_scraped_at": "now()"}) \
                    .eq("slug", slug) \
                    .execute()
            except Exception as db_err:
                print(f"  Warning: Failed to update last_scraped_at: {db_err}")

    elapsed_time = time.time() - start_time
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)
    
    print("\n=== SCRAPER EXECUTION COMPLETE ===")
    print(f"Total time taken: {minutes}m {seconds}s")
    print(f"Successfully scraped: {success_count}/{len(cities)} cities")
    print(f"Failed / Skipped: {fail_count}/{len(cities)} cities")

if __name__ == "__main__":
    main()
