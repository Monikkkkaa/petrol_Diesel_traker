import sys
import os
import time

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client
from api._utils.extract_state import get_city_fuel_prices

def main():
    print("Initializing Supabase client for MP scraping...")
    supabase = get_supabase_client()
    
    # Query all cities in Madhya Pradesh
    res = supabase.table("cities") \
        .select("slug, name, state") \
        .eq("state", "Madhya Pradesh") \
        .execute()
        
    cities = res.data or []
    print(f"Found {len(cities)} cities in Madhya Pradesh. Scraping...")
    
    for i, city in enumerate(cities):
        slug = city['slug']
        name = city['name']
        
        if i > 0:
            time.sleep(1.0)
            
        print(f"({i+1}/{len(cities)}) Scraping {name} ({slug})...")
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
                print(f"  [OK] Success: Upserted {len(price_rows)} prices.")
            else:
                print(f"  [FAIL] Failed: No prices found.")
        except Exception as e:
            print(f"  [FAIL] Failed: {e}")
            
    print("Scraping for Madhya Pradesh completed successfully!")

if __name__ == "__main__":
    main()
