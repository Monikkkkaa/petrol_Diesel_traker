import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api._utils.supabase_client import get_supabase_client

def main():
    try:
        supabase = get_supabase_client()
        res = supabase.table("cities").select("*").eq("state", "Chhattisgarh").execute()
        print("Chhattisgarh cities:", res.data)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
