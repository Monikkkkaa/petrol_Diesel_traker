import sys
import os
import requests
import json

# Add project root to sys.path to import from api
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from api._utils.supabase_client import get_supabase_client
from api._utils.extract_state import fetch_city_html, extract_initial_state

MAJOR_CITIES_BY_STATE = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Anantapur", "Kadapa"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Anand", "Morbi"],
    "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Nahan", "Una"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davangere", "Bellary", "Shimoga"],
    "Kerala": ["Kochi", "Trivandrum", "Thiruvananthapuram", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Kottayam", "Kannur"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar"],
    "Sikkim": ["Gangtok"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tiruppur", "Erode", "Vellore", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar"],
    "Tripura": ["Agartala"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Prayagraj", "Bareilly", "Aligarh", "Noida", "Greater Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Rudrapur", "Roorkee", "Rishikesh"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Kharagpur", "Haldia"],
    "Andaman and Nicobar": ["Port Blair"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli": ["Silvassa"],
    "Daman and Diu": ["Daman"],
    "Delhi": ["Delhi", "New Delhi"],
    "Lakshadweep": ["Kavaratti"],
    "Puducherry": ["Pondicherry", "Karaikal"],
    "Ladakh": ["Leh", "Kargil"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Silvassa"]
}

def normalize(name: str) -> str:
    return "".join(name.lower().split()).replace("-", "").replace(" ", "")

def main():
    print("Initializing Supabase client...")
    try:
        supabase = get_supabase_client()
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        print("Please check your environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY.")
        sys.exit(1)

    print("Fetching Cardekho state data...")
    try:
        # Fetching Delhi as the seed/landing page to get cities/states config
        html = fetch_city_html("delhi")
        state_data = extract_initial_state(html)
    except Exception as e:
        print(f"Error fetching state data from Cardekho: {e}")
        sys.exit(1)

    cities = state_data.get("cities", [])
    if not cities:
        print("No cities found in INITIAL_STATE JSON.")
        sys.exit(1)

    print(f"Found {len(cities)} total cities in Cardekho. Filtering major cities...")

    # Build target normalized set
    target_normalized = {}
    for state, names in MAJOR_CITIES_BY_STATE.items():
        for name in names:
            target_normalized[normalize(name)] = (state, name)

    db_cities = []
    seen_slugs = set()
    
    for city in cities:
        slug = city.get("slug")
        name = city.get("text")
        state_name = city.get("stateName")
        
        if not slug or not name or not state_name:
            continue
            
        if slug in seen_slugs:
            continue
            
        norm_name = normalize(name)
        norm_slug = normalize(slug)
        
        # Check if match
        is_match = False
        if norm_name in target_normalized or norm_slug in target_normalized:
            is_match = True
        elif name.lower() in ["delhi", "new delhi"]:
            is_match = True
            
        if is_match:
            db_cities.append({
                "slug": slug,
                "name": name,
                "state": state_name
            })
            seen_slugs.add(slug)

    print(f"Filtered down to {len(db_cities)} major cities. Seeding to Supabase...")

    # Batch insert to Supabase
    success_count = 0
    batch_size = 50
    for i in range(0, len(db_cities), batch_size):
        batch = db_cities[i:i + batch_size]
        try:
            # Using upsert to prevent unique key errors if run multiple times
            response = supabase.table("cities").upsert(batch).execute()
            success_count += len(batch)
            print(f"Upserted batch {i // batch_size + 1}: {len(batch)} cities successfully.")
        except Exception as e:
            print(f"Error upserting batch {i // batch_size + 1}: {e}")

    print(f"\nDone! Successfully seeded {success_count} cities into the database.")

if __name__ == "__main__":
    main()
