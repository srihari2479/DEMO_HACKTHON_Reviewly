from playwright.sync_api import sync_playwright
import os

class PlaywrightService:
    def capture_screenshot(self, url: str, output_path: str) -> bool:
        """
        Launches headless Chromium, visits the specified URL, and takes a desktop screenshot.
        """
        try:
            # Ensure the containing directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                # Standard desktop viewport configuration
                context = browser.new_context(viewport={"width": 1280, "height": 800})
                page = context.new_page()
                
                # Visit target URL and wait for load network completion
                print(f"[Playwright] Navigating to: {url}")
                page.goto(url, wait_until="networkidle", timeout=30000)
                
                # Capture visual snapshot
                page.screenshot(path=output_path)
                print(f"[Playwright] Captured screenshot saved to: {output_path}")
                browser.close()
                return True
        except Exception as e:
            print(f"[Playwright] Capture failed for '{url}': {str(e)}")
            return False

playwright_service = PlaywrightService()
