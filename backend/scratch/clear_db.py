import os
from supabase import create_client
from dotenv import load_dotenv

def clear_database():
    print("--- Reviewly Database Cleaner ---")
    
    # Load env credentials
    load_dotenv()
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: Supabase URL or Key not found in .env file.")
        return
        
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("Connected to Supabase. Deleting all audits...")
        
        # Deleting all rows where pr_number is greater than 0
        response = supabase.table("pr_audits").delete().gt("pr_number", 0).execute()
        
        print("Database table 'pr_audits' cleared successfully!")
        print(f"Deleted rows count: {len(response.data) if hasattr(response, 'data') else 'N/A'}")
        
    except Exception as e:
        print(f"Error executing database clear: {str(e)}")

if __name__ == "__main__":
    clear_database()
