import os
from supabase import create_client, Client

def load_env_file():
    """Manually parse .env.local or .env to populate os.environ for local scripts."""
    possible_paths = [
        ".env.local",
        ".env",
        # If running from a subfolder like scripts/
        "../.env.local",
        "../.env",
        # If running from api/
        "../../.env.local",
        "../../.env"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'").strip('"')
                            # Set if not already present in environment
                            if key not in os.environ:
                                os.environ[key] = val
                break
            except Exception as e:
                print(f"Warning: Failed to read env file at {path}: {e}")

def get_supabase_client() -> Client:
    # Load local env variables if running outside Vercel production
    load_env_file()
    
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        raise ValueError(
            "Missing environment variables. Please set SUPABASE_URL "
            "(or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_KEY."
        )
        
    return create_client(url, key)
