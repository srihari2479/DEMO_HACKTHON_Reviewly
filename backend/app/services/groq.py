from groq import Groq
from app.core.config import settings

class GroqService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def summarize_diff(self, git_diff: str) -> str:
        if not git_diff or git_diff.strip() == "":
            return "No code changes detected in this pull request."

        # Truncate large git diffs to prevent exceeding Groq TPM token limits
        if len(git_diff) > 15000:
            git_diff = git_diff[:15000] + "\n\n[... Git diff truncated to prevent token limits ...]"

        prompt = f"""You are an expert technical translator. Your job is to read raw code changes (git diff) and explain exactly what changed in simple, direct, non-technical English. 
- Focus only on user-facing features (like new forms, updated buttons, color adjustments, routing updates).
- Explain the user benefit or effect.
- Limit your response to 2 to 4 clean bullet points.
- Do NOT use technical jargon (e.g. do not say "added event handler onClick", say "added a click handler to save form data").
- Do NOT output markdown code blocks or introduction sentences. Just output the bullet points directly.

Here is the git diff:
{git_diff}
"""
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.1
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating summary: {str(e)}"

groq_service = GroqService()
