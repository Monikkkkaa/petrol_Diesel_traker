import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.extract_state import fetch_city_html, extract_initial_state, extract_prices_from_state

MAJOR_CITIES_BY_STATE = {
    "Delhi": ["Delhi", "New Delhi"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Karnataka": ["Bangalore", "Mysore"],
    "Tamil Nadu": ["Chennai", "Coimbatore"]
}

def normalize(name: str) -> str:
    return "".join(name.lower().split()).replace("-", "").replace(" ", "")

def main():
    print("=== DRY RUN VERIFICATION ===")
    
    print("\n1. Testing Seeder logic (fetching landing page and extracting cities)...")
    try:
        html = fetch_city_html("delhi")
        state_data = extract_initial_state(html)
        cities = state_data.get("cities", [])
        print(f"✓ Successfully fetched and parsed INITIAL_STATE.")
        print(f"✓ Total cities in Cardekho list: {len(cities)}")
        
        # Test filtering
        target_normalized = {}
        for state, names in MAJOR_CITIES_BY_STATE.items():
            for name in names:
                target_normalized[normalize(name)] = (state, name)
                
        matched = []
        for city in cities:
            slug = city.get("slug")
            name = city.get("text")
            state_name = city.get("stateName")
            
            norm_name = normalize(name)
            norm_slug = normalize(slug)
            
            if norm_name in target_normalized or norm_slug in target_normalized or name.lower() in ["delhi", "new delhi"]:
                matched.append((name, slug, state_name))
                
        print(f"✓ Filtered major cities count (using small test set): {len(matched)}")
        print(f"✓ Sample filtered cities: {matched[:5]}")
        
    except Exception as e:
        print(f"✗ Failed Seeder dry run: {e}")
        sys.exit(1)
        
    print("\n2. Testing Scraper logic (extracting fuel prices)...")
    try:
        # Test parsing Delhi fuel prices from the state data we already fetched
        prices = extract_prices_from_state(state_data)
        print(f"✓ Successfully extracted fuel prices.")
        print(f"✓ Total days extracted: {len(prices)}")
        if prices:
            print("✓ Latest record:")
            print(f"  Date: {prices[0]['date']}")
            print(f"  Petrol Price: ₹{prices[0]['petrol_price']}")
            print(f"  Diesel Price: ₹{prices[0]['diesel_price']}")
            
            if len(prices) > 1:
                print("✓ Previous day record:")
                print(f"  Date: {prices[1]['date']}")
                print(f"  Petrol Price: ₹{prices[1]['petrol_price']}")
                print(f"  Diesel Price: ₹{prices[1]['diesel_price']}")
        else:
            print("✗ No fuel prices extracted. Check if dateWisePriceRate structure changed.")
            sys.exit(1)
            
    except Exception as e:
        print(f"✗ Failed Scraper dry run: {e}")
        sys.exit(1)
        
    print("\n=== DRY RUN PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
