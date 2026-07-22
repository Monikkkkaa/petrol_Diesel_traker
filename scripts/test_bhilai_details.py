import requests
import re
import json

url = "https://www.cardekho.com/fuel-price-in-bhilai-city"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

try:
    r = requests.get(url, headers=headers, timeout=10)
    print("Bhilai Status:", r.status_code)
    
    pattern = r"window\.__INITIAL_STATE__\s*=\s*(\{.*?\});"
    match = re.search(pattern, r.text)
    if match:
        data = json.loads(match.group(1))
        print("Keys in state:", list(data.keys()))
        
        # Check dateWisePriceRate
        pw = data.get('dateWisePriceRate', {})
        print("dateWisePriceRate structure:", type(pw))
        if isinstance(pw, dict):
            print("dateWisePriceRate keys:", list(pw.keys()))
            items = pw.get('items', [])
            print("Items count:", len(items))
            if items:
                print("First item:", items[0])
            else:
                # If dateWisePriceRate is empty or has no items, print some other keys that might have price
                print("No items in dateWisePriceRate. Checking dateWiseCityStatePrice:")
                print(list(data.get('dateWiseCityStatePrice', {}).keys()) if isinstance(data.get('dateWiseCityStatePrice'), dict) else "N/A")
                print("Checking todayfuelPriceInPopularCity:")
                print(list(data.get('todayfuelPriceInPopularCity', {}).keys()) if isinstance(data.get('todayfuelPriceInPopularCity'), dict) else "N/A")
    else:
        print("Could not find INITIAL_STATE")
except Exception as e:
    print("Error:", e)
