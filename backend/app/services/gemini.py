import google.generativeai as genai
import PIL.Image
import httpx
from io import BytesIO
from app.core.config import settings
from typing import Tuple

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def _download_image(self, url: str) -> PIL.Image.Image:
        try:
            response = httpx.get(url, timeout=10.0)
            if response.status_code == 200:
                return PIL.Image.open(BytesIO(response.content))
        except Exception:
            pass
        return None

    def analyze_ui_changes(self, git_diff: str, before_url: str, after_url: str) -> Tuple[str, str]:
        """
        Compares before and after screenshots, analyzing visual changes and flagging UX risks.
        Returns: (visual_changes_summary, ux_risks_summary)
        """
        # Download screenshots
        before_img = self._download_image(before_url) if before_url else None
        after_img = self._download_image(after_url) if after_url else None

        prompt = f"""You are a professional UX/UI Auditor. You review user interface differences to help Product Managers verify what changed and find bugs.

Analyze the raw code changes (git diff) below:
{git_diff}

Instructions:
1. Review the code changes.
2. If 'Before' and 'After' screenshots are provided, compare them visually to see the layout shifts, design alterations, and interface revisions.
3. Identify visual changes and explain them clearly.
4. Flag any critical UX risks (e.g. elements overlapping, low contrast, text cutoff, buttons hidden on mobile).

Provide your feedback in exactly two sections, separated by a '---' line:
Section 1: Detailed list of visual modifications in bullet points.
Section 2: Detailed list of UX risks or issues introduced (if none, write 'No critical UX risks identified.').

Be direct, clear, and write for non-technical stakeholders. Avoid referencing HTML code or styling classes.
"""

        contents = [prompt]
        if before_img:
            contents.append("Before screenshot:")
            contents.append(before_img)
        if after_img:
            contents.append("After screenshot:")
            contents.append(after_img)

        try:
            response = self.model.generate_content(contents)
            text = response.text
            
            # Split by markdown horizontal rule to get the two sections
            if "---" in text:
                parts = text.split("---", 1)
                changes = parts[0].strip()
                risks = parts[1].strip()
                return changes, risks
            else:
                return text, "No critical UX risks identified."
        except Exception as e:
            return f"Error running Gemini visual audit: {str(e)}", "Unable to audit UX risks."

gemini_service = GeminiService()
