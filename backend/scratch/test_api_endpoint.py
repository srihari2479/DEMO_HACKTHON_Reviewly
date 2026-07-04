import httpx
import time

def test_api_submit():
    print("--- Starting Reviewly API Endpoint Test ---")
    
    url = "http://127.0.0.1:7860/api/pr/submit"
    
    payload = {
        "pr_number": 202,
        "title": "Redesign Pricing Tiers and Add Toggle Button",
        "author": "dev_alex",
        "repository": "Reviewly/frontend",
        "git_diff": """diff --git a/components/Pricing.js b/components/Pricing.js
index 92fa1b..73ac0a 100644
--- a/components/Pricing.js
+++ b/components/Pricing.js
@@ -12,4 +12,12 @@ export default function Pricing() {
-      <h3>Premium Plan: $49/mo</h3>
+      <div className="toggle-pricing">
+        <span>Monthly</span><button className="bg-teal-500">Toggle</button><span>Annually</span>
+      </div>
+      <h3>Premium Plan: $39/mo (Billed Annually)</h3>
+      <a href="/checkout" className="btn mt-4">Get Started</a>""",
        "before_screenshot_url": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
        "after_screenshot_url": "https://images.unsplash.com/photo-1541462608141-2ff01dd914e0?w=600",
        "portal_base_url": "http://localhost:5173"
    }

    try:
        print("Sending POST request to FastAPI endpoint...")
        start_time = time.time()
        response = httpx.post(url, json=payload, timeout=60.0)
        duration = time.time() - start_time
        
        print(f"\nResponse Code: {response.status_code} (took {duration:.2f}s)")
        
        if response.status_code == 200:
            data = response.json()
            print("API Response Body:")
            print(f" - Status: {data.get('status')}")
            audit = data.get("audit", {})
            print(f" - Saved Audit ID: {audit.get('id')}")
            print(f" - Generated Summary:\n{audit.get('ai_summary')}")
            print(f" - Flagged Risks:\n{audit.get('ai_risks')}")
        else:
            print(f"API Error Response: {response.text}")
            
    except Exception as e:
        print(f"Failed to connect to API server: {str(e)}")
        print("Check if the uvicorn server is running on port 7860.")

if __name__ == "__main__":
    # Wait a moment for server to bind
    time.sleep(2)
    test_api_submit()
