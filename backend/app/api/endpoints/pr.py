from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.supabase import supabase_service
from app.services.groq import groq_service
from app.services.gemini import gemini_service
from app.services.slack import slack_service

router = APIRouter(prefix="/api/pr", tags=["Pull Requests"])

# Request/Response Schemas
class SubmitPRRequest(BaseModel):
    pr_number: int
    title: str
    author: str
    repository: str
    git_diff: str
    before_screenshot_url: Optional[str] = None
    after_screenshot_url: Optional[str] = None
    portal_base_url: Optional[str] = "http://localhost:5173"

class ReviewPRRequest(BaseModel):
    status: str # 'approved' or 'changes_requested'
    reviewer_comments: Optional[str] = None

@router.post("/submit")
def submit_pull_request(payload: SubmitPRRequest):
    """
    Submits a pull request for automated review. Generates AI summary (Groq),
    runs multimodal UI audit (Gemini), saves record to Supabase, and triggers Slack alert.
    """
    # 1. Run AI summarizing on Code Diff (Groq)
    ai_summary = groq_service.summarize_diff(payload.git_diff)

    # 2. Run Multimodal UI comparison (Gemini)
    visual_changes, ai_risks = gemini_service.analyze_ui_changes(
        git_diff=payload.git_diff,
        before_url=payload.before_screenshot_url,
        after_url=payload.after_screenshot_url
    )

    # Combine visual audit into summary if needed, or store separately
    final_summary = f"{ai_summary}\n\n*Visual Updates:*\n{visual_changes}"

    # 3. Save audit record to Supabase
    audit = supabase_service.create_audit(
        pr_number=payload.pr_number,
        title=payload.title,
        author=payload.author,
        repository=payload.repository,
        git_diff=payload.git_diff,
        before_screenshot_url=payload.before_screenshot_url,
        after_screenshot_url=payload.after_screenshot_url,
        ai_summary=final_summary,
        ai_risks=ai_risks
    )

    if not audit:
        raise HTTPException(status_code=500, detail="Failed to create audit record in Supabase.")

    # 4. Trigger Slack notification
    slack_service.send_pr_notification(
        audit_id=audit["id"],
        pr_number=payload.pr_number,
        title=payload.title,
        author=payload.author,
        repository=payload.repository,
        ai_summary=final_summary,
        ai_risks=ai_risks,
        portal_base_url=payload.portal_base_url
    )

    return {"status": "success", "audit": audit}

@router.get("/list")
def list_pull_requests():
    """
    Retrieves all PR audits from Supabase.
    """
    audits = supabase_service.list_audits()
    return {"status": "success", "count": len(audits), "data": audits}

@router.get("/{audit_id}")
def get_pull_request(audit_id: str):
    """
    Retrieves a single PR audit by ID.
    """
    audit = supabase_service.get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="PR Audit record not found.")
    return {"status": "success", "data": audit}

@router.patch("/{audit_id}/review")
def review_pull_request(audit_id: str, payload: ReviewPRRequest):
    """
    Submits a product manager approval or rejection.
    """
    if payload.status not in ["approved", "changes_requested"]:
        raise HTTPException(status_code=400, detail="Status must be either 'approved' or 'changes_requested'.")

    audit = supabase_service.update_audit_status(
        audit_id=audit_id,
        status=payload.status,
        reviewer_comments=payload.reviewer_comments
    )

    if not audit:
        raise HTTPException(status_code=404, detail="Failed to submit review; record not found.")

    return {"status": "success", "data": audit}
