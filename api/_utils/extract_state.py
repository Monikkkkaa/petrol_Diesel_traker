import re
import json
import requests
from datetime import datetime
from typing import Dict, Any, List, Tuple

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def clean_price(rate_str: str) -> float:
    """Strip currency symbol, commas and whitespace, then convert to float."""
    cleaned = rate_str.replace("₹", "").replace(",", "").strip()
    return float(cleaned)

def parse_date(date_str: str) -> str:
    """Convert '21-Jul-2026' to '2026-07-21'."""
    dt = datetime.strptime(date_str.strip(), "%d-%b-%Y")
    return dt.strftime("%Y-%m-%d")

def fetch_city_html(city_slug: str, retries: int = 3, backoff: float = 1.0) -> str:
    """Fetch the Cardekho fuel price page for a city with retry logic."""
    url = f"https://www.cardekho.com/fuel-price-in-{city_slug}-city"
    import time
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                return response.text
            elif response.status_code == 404:
                # Page doesn't exist, don't retry
                raise ValueError(f"City page not found (404) for slug: {city_slug}")
            else:
                print(f"Attempt {attempt + 1} failed for {city_slug} with status {response.status_code}")
        except Exception as e:
            print(f"Attempt {attempt + 1} failed for {city_slug} with error: {e}")
        time.sleep(backoff * (attempt + 1))
    raise RuntimeError(f"Failed to fetch page for {city_slug} after {retries} retries")

def extract_initial_state(html_content: str) -> Dict[str, Any]:
    """Extract and parse window.__INITIAL_STATE__ from HTML."""
    pattern = r"window\.__INITIAL_STATE__\s*=\s*(\{.*?\});"
    match = re.search(pattern, html_content)
    if not match:
        raise ValueError("Could not find window.__INITIAL_STATE__ in page source.")
    return json.loads(match.group(1))

def extract_prices_from_state(state_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract petrol and diesel prices grouped by date from the initial state JSON."""
    price_rates = state_data.get("dateWisePriceRate", {})
    items = price_rates.get("items", [])
    
    petrol_prices: Dict[str, float] = {}
    diesel_prices: Dict[str, float] = {}
    
    for fuel_data in items:
        title = fuel_data.get("title", "").strip()
        sub_items = fuel_data.get("items", [])
        
        # Skip the header row at index 0
        for entry in sub_items[1:]:
            date_raw = entry.get("itemName")
            rate_raw = entry.get("rate")
            
            if not date_raw or not rate_raw:
                continue
                
            try:
                date_iso = parse_date(date_raw)
                price = clean_price(rate_raw)
                
                if title == "Petrol":
                    petrol_prices[date_iso] = price
                elif title == "Diesel":
                    diesel_prices[date_iso] = price
            except Exception as e:
                # Log parsing errors for individual lines but keep going
                print(f"Error parsing price entry {entry}: {e}")
                
    # Combine petrol and diesel prices by date
    combined: List[Dict[str, Any]] = []
    # Use union of all dates found
    all_dates = sorted(set(petrol_prices.keys()).union(diesel_prices.keys()), reverse=True)
    
    for date_iso in all_dates:
        # We only include if we have both petrol and diesel prices for that date
        if date_iso in petrol_prices and date_iso in diesel_prices:
            combined.append({
                "date": date_iso,
                "petrol_price": petrol_prices[date_iso],
                "diesel_price": diesel_prices[date_iso]
            })
            
    return combined

def get_city_fuel_prices(city_slug: str) -> List[Dict[str, Any]]:
    """Fetch, extract, and format fuel prices for a city."""
    html = fetch_city_html(city_slug)
    state_data = extract_initial_state(html)
    return extract_prices_from_state(state_data)
