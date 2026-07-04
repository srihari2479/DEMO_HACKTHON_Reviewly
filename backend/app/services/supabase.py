from supabase import create_client, Client
from app.core.config import settings
from typing import List, Dict, Any, Optional

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    def create_audit(
        self,
        pr_number: int,
        title: str,
        author: str,
        repository: str,
        git_diff: str,
        before_screenshot_url: str,
        after_screenshot_url: str,
        ai_summary: str,
        ai_risks: str,
        user_email: str
    ) -> Dict[str, Any]:
        data = {
            "pr_number": pr_number,
            "title": title,
            "author": author,
            "repository": repository,
            "git_diff": git_diff,
            "before_screenshot_url": before_screenshot_url,
            "after_screenshot_url": after_screenshot_url,
            "ai_summary": ai_summary,
            "ai_risks": ai_risks,
            "user_email": user_email,
            "status": "pending_review"
        }
        response = self.client.table("pr_audits").insert(data).execute()
        return response.data[0] if response.data else {}

    def list_audits(self, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.client.table("pr_audits").select("*")
        if user_email:
            query = query.eq("user_email", user_email)
        response = query.order("created_at", desc=True).execute()
        return response.data if response.data else []

    def get_audit(self, audit_id: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("pr_audits").select("*").eq("id", audit_id).execute()
        return response.data[0] if response.data else None

    def get_audit_by_number(self, repository: str, pr_number: int, user_email: str) -> Optional[Dict[str, Any]]:
        response = self.client.table("pr_audits").select("*").eq("repository", repository).eq("pr_number", pr_number).eq("user_email", user_email).execute()
        return response.data[0] if response.data else None

    def update_audit_status(self, audit_id: str, status: str, reviewer_comments: Optional[str] = None) -> Optional[Dict[str, Any]]:
        update_data = {"status": status}
        if reviewer_comments is not None:
            update_data["reviewer_comments"] = reviewer_comments
            
        response = self.client.table("pr_audits").update(update_data).eq("id", audit_id).execute()
        return response.data[0] if response.data else None

supabase_service = SupabaseService()
