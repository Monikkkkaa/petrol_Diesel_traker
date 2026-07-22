import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client

def main():
    try:
        supabase = get_supabase_client()
        
        # Count cities
        cities_res = supabase.table("cities").select("slug", count="exact").execute()
        cities_count = len(cities_res.data or [])
        print(f"Total cities in database: {cities_count}")
        
        # Count fuel prices
        prices_res = supabase.table("fuel_prices").select("id", count="exact").execute()
        prices_count = len(prices_res.data or [])
        print(f"Total fuel price rows in database: {prices_count}")
        
        # Fetch Bhilai prices
        bhilai_res = supabase.table("fuel_prices").select("*").eq("city_slug", "bhilai").execute()
        print(f"Bhilai price records ({len(bhilai_res.data or [])}): {bhilai_res.data}")
        
        # Fetch some recent prices
        recent_res = supabase.table("fuel_prices").select("city_slug, date, petrol_price, diesel_price").order("scraped_at", desc=True).limit(5).execute()
        print(f"Most recent 5 prices scraped: {recent_res.data}")
        
    except Exception as e:
        print("Error checking database:", e)

if __name__ == "__main__":
    main()
