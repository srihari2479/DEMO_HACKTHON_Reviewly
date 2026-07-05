import google.generativeai as genai
import PIL.Image
import httpx
import os
from io import BytesIO
from app.core.config import settings
from typing import Tuple

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def _download_image(self, url: str) -> PIL.Image.Image:
        try:
            # Direct-load local static files to prevent self-HTTP deadlock on single-threaded workers
            if "localhost:7860/static" in url or "127.0.0.1:7860/static" in url:
                path_suffix = url.split("/static/")[1]
                local_path = os.path.join("app/static", path_suffix)
                if os.path.exists(local_path):
                    print(f"[Gemini] Loading local static image directly from disk: {local_path}")
                    return PIL.Image.open(local_path)
            
            # Fetch remote assets
            response = httpx.get(url, timeout=10.0)
            if response.status_code == 200:
                return PIL.Image.open(BytesIO(response.content))
        except Exception as e:
            print(f"[Gemini] Image loading failed: {str(e)}")
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
2. Compare the 'Before' and 'After' screenshots visually to see the layout shifts, design alterations, and interface revisions.
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
            # Fallback to Groq Llama-3.3 diff-based UI/UX auditor on quota/rate-limits
            try:
                from app.services.groq import groq_service
                
                fallback_prompt = f"""You are a professional UX/UI Auditor. 
Analyze the raw code changes (git diff) below to evaluate visual modifications and potential UX risks:
{git_diff}

Instructions:
1. Review the code changes.
2. Identify the visual modifications that will happen in the user interface.
3. STRICTLY limit your analysis to the exact line additions (+) and deletions (-) in the diff. Do NOT assume, invent, or hallucinate changes (such as "new hero sections" or "redesigned forms") if a file was only reformatted or cleaned up.
4. If a file was only reformatted (whitespace adjustments, minor cleanups, formatting) without changing visual elements, explicitly report it as "whitespace/reformatting cleanup only".
5. Flag any critical UX risks (e.g. elements overlapping, layout shifts, mobile responsiveness issues, hidden interactive elements).

Provide your feedback in exactly two sections, separated by a '---' line:
Section 1: Detailed list of visual modifications in bullet points.
Section 2: Detailed list of UX risks or issues introduced (if none, write 'No critical UX risks identified.').

Be direct, clear, and write for non-technical stakeholders. Avoid referencing HTML code or styling classes.
"""
                completion = groq_service.client.chat.completions.create(
                    messages=[
                        {"role": "user", "content": fallback_prompt}
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.1
                )
                text = completion.choices[0].message.content.strip()
                if "---" in text:
                    parts = text.split("---", 1)
                    changes = parts[0].strip()
                    risks = parts[1].strip()
                    return changes, risks
                else:
                    return text, "No critical UX risks identified."
            except Exception as fallback_err:
                return f"Error running Gemini visual audit: {str(e)}. Fallback failed: {str(fallback_err)}", "Unable to audit UX risks."

gemini_service = GeminiService()
