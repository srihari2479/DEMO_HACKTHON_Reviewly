import sys
import os

# Add root folder to python path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.services.groq import groq_service
from app.services.gemini import gemini_service
from app.services.slack import slack_service
from app.services.supabase import supabase_service

def test_pipeline():
    print("--- starting reviewly pipeline test ---")
    
    # 1. Test Git Diff
    mock_diff = """diff --git a/components/Login.js b/components/Login.js
index 838afd..92fa1b 100644
--- a/components/Login.js
+++ b/components/Login.js
@@ -10,6 +10,12 @@ export default function Login() {
       <button className="bg-indigo-600 text-white">Sign In</button>
+      <button className="bg-blue-500 text-white flex items-center">
+        <img src="/google-icon.svg" /> Sign in with Google
+      </button>
+      <a href="/signup" className="text-gray-500 mt-8">Don''t have an account? Sign Up</a>"""

    print("\n[1/4] Testing Groq Code Summarization...")
    summary = groq_service.summarize_diff(mock_diff)
    print(f"Groq Summary Output:\n{summary}")

    # 2. Test Gemini UI Audit
    # We use a couple of stable placeholder image urls representing UI layouts
    before_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
    after_url = "https://images.unsplash.com/photo-1618005198143-e528346d9a59?w=600"

    print("\n[2/4] Testing Gemini Multimodal UI Audit...")
    visual_changes, risks = gemini_service.analyze_ui_changes(mock_diff, before_url, after_url)
    print(f"Visual Changes Detected:\n{visual_changes}")
    print(f"UX Risks Flagged:\n{risks}")

    # 3. Test Supabase Database Write
    print("\n[3/4] Testing Supabase DB Insert...")
    try:
        audit = supabase_service.create_audit(
            pr_number=999,
            title="Test PR - Setup Google OAuth",
            author="test_developer",
            repository="reviewly-test-repo",
            git_diff=mock_diff,
            before_screenshot_url=before_url,
            after_screenshot_url=after_url,
            ai_summary=f"{summary}\n\n*Visual Updates:*\n{visual_changes}",
            ai_risks=risks
        )
        if audit and "id" in audit:
            print(f"Supabase DB Insert Successful! Audit ID: {audit['id']}")
            audit_id = audit["id"]
        else:
            print("Supabase returned empty row.")
            audit_id = "mock-audit-uuid-1234"
    except Exception as e:
        print(f"Supabase DB Insert Failed: {str(e)}")
        audit_id = "mock-audit-uuid-1234"

    # 4. Test Slack Notification
    print("\n[4/4] Testing Slack Webhook...")
    slack_success = slack_service.send_pr_notification(
        audit_id=audit_id,
        pr_number=999,
        title="Test PR - Setup Google OAuth",
        author="test_developer",
        repository="reviewly-test-repo",
        ai_summary=summary,
        ai_risks=risks,
        portal_base_url="http://localhost:5173"
    )
    if slack_success:
        print("Slack webhook sent successfully!")
    else:
        print("Slack notification failed (Check your SLACK_WEBHOOK_URL).")

    print("\n--- Pipeline test completed ---")

if __name__ == "__main__":
    # Check if necessary env variables are set
    missing_vars = []
    for var in ["SUPABASE_URL", "SUPABASE_KEY", "GEMINI_API_KEY", "GROQ_API_KEY"]:
        if not os.environ.get(var) and not os.path.exists(".env"):
            missing_vars.append(var)
            
    if missing_vars:
        print(f"Warning: Missing environment variables: {', '.join(missing_vars)}")
        print("Create a '.env' file in 'backend/' with these keys to run the test script successfully.")
    else:
        test_pipeline()
