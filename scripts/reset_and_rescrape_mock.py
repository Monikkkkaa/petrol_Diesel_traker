import sys
import os

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client

def main():
    try:
        supabase = get_supabase_client()
        
        # 1. Find all city slugs that have records for July 22nd
        print("Finding cities with July 22nd data...")
        res = supabase.table("fuel_prices").select("city_slug").eq("date", "2026-07-22").execute()
        slugs = list(set(row["city_slug"] for row in (res.data or [])))
        
        if not slugs:
            print("No cities found with July 22nd data.")
            return
            
        print(f"Found {len(slugs)} cities with mock July 22nd data: {slugs}")
        
        # 2. Delete all pricing rows for these cities
        print("Deleting pricing rows for these cities...")
        supabase.table("fuel_prices").delete().in_("city_slug", slugs).execute()
        
        # 3. Reset last_scraped_at for these cities
        print("Resetting last_scraped_at in cities table...")
        supabase.table("cities").update({"last_scraped_at": None}).in_("slug", slugs).execute()
        
        print("Reset complete! Now running scrape_all_remaining.py to re-populate with aligned dates...")
        
        # 4. Import and execute the remaining cities scraper
        from scripts.scrape_all_remaining import main as run_scraper
        run_scraper()
        
    except Exception as e:
        print("Error during reset and rescrape:", e)

if __name__ == "__main__":
    main()
