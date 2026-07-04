from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
import re
import httpx
import os
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

@router.post("/webhook")
async def github_webhook(request: Request):
    """
    Captures Pull Request webhook events from GitHub, fetches raw code diffs from 
    the GitHub API, parses before/after screenshots from descriptions, and triggers audits.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")
        
    # Check if this is a pull_request event
    if "pull_request" not in payload:
        return {"status": "ignored", "message": "Event is not a pull request event."}
        
    action = payload.get("action")
    if action not in ["opened", "synchronize", "reopened"]:
        return {"status": "ignored", "message": f"PR action '{action}' is not audited."}
        
    pr_number = payload["number"]
    title = payload["pull_request"]["title"]
    author = payload["pull_request"]["user"]["login"]
    repository = payload["repository"]["full_name"]
    pr_body = payload["pull_request"].get("body") or ""
    
    # 1. Fetch raw git diff from GitHub API
    diff_url = f"https://api.github.com/repos/{repository}/pulls/{pr_number}"
    headers = {
        "Accept": "application/vnd.github.v3.diff",
        "User-Agent": "Reviewly-Auditor"
    }
    # Add optional GitHub Token if configured in env for private repos
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
        
    git_diff = ""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(diff_url, headers=headers, timeout=15.0)
            if response.status_code == 200:
                git_diff = response.text
            else:
                git_diff = f"Error fetching diff from GitHub: HTTP {response.status_code}\n{response.text}"
    except Exception as e:
        git_diff = f"Failed to fetch diff: {str(e)}"
        
    # 2. Extract before/after screenshots from PR description using Regex
    image_pattern = r'!\[.*?\]\((https?://.*?)\)'
    images = re.findall(image_pattern, pr_body)
    
    # Also support simple image links ending in extension
    if len(images) < 2:
        url_pattern = r'(https?://[^\s)]+\.(?:png|jpg|jpeg|gif))'
        found_urls = re.findall(url_pattern, pr_body)
        for url in found_urls:
            if url not in images:
                images.append(url)
                
    before_url = images[0] if len(images) > 0 else "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600"
    after_url = images[1] if len(images) > 1 else "https://images.unsplash.com/photo-1541462608141-2ff01dd914e0?w=600"
    
    # 3. Trigger the full Reviewly audit pipeline
    ai_summary = groq_service.summarize_diff(git_diff)
    visual_changes, ai_risks = gemini_service.analyze_ui_changes(
        git_diff=git_diff,
        before_url=before_url,
        after_url=after_url
    )
    final_summary = f"{ai_summary}\n\n*Visual Updates:*\n{visual_changes}"
    
    # 4. Write record to Supabase
    audit = supabase_service.create_audit(
        pr_number=pr_number,
        title=title,
        author=author,
        repository=repository,
        git_diff=git_diff,
        before_screenshot_url=before_url,
        after_screenshot_url=after_url,
        ai_summary=final_summary,
        ai_risks=ai_risks
    )
    
    if not audit:
        raise HTTPException(status_code=500, detail="Failed to record audit in Supabase.")
        
    # 5. Broadcast to Slack
    slack_service.send_pr_notification(
        audit_id=audit["id"],
        pr_number=pr_number,
        title=title,
        author=author,
        repository=repository,
        ai_summary=final_summary,
        ai_risks=ai_risks,
        portal_base_url="http://localhost:5173"
    )
    
    return {"status": "success", "audit_id": audit["id"], "action": "audited"}

class AuditRepoRequest(BaseModel):
    repository: str
    pr_number: int

@router.post("/audit-repo")
async def audit_repository_pr(payload: AuditRepoRequest):
    """
    Manually triggers a real-time audit for a specific GitHub Repository Pull Request.
    Fetches PR details and raw diffs directly from GitHub API, runs analyses, and saves results.
    """
    repository = payload.repository
    pr_number = payload.pr_number
    
    # 1. Fetch Pull Request details (Title, Author, Body) from GitHub API
    detail_url = f"https://api.github.com/repos/{repository}/pulls/{pr_number}"
    headers = {
        "User-Agent": "Reviewly-Auditor"
    }
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        headers["Authorization"] = f"token {github_token}"
        
    try:
        async with httpx.AsyncClient() as client:
            meta_resp = await client.get(detail_url, headers=headers, timeout=10.0)
            
            # Fallback in case of a stale or invalid GITHUB_TOKEN in OS env
            if meta_resp.status_code == 401 and github_token:
                print("Warning: GITHUB_TOKEN from system environment returned 401. Retrying request unauthenticated...")
                headers.pop("Authorization", None)
                meta_resp = await client.get(detail_url, headers=headers, timeout=10.0)
                
            if meta_resp.status_code != 200:
                raise HTTPException(status_code=meta_resp.status_code, detail=f"Failed to fetch PR details from GitHub: {meta_resp.text}")
            
            meta_data = meta_resp.json()
            title = meta_data.get("title", f"PR #{pr_number}")
            author = meta_data.get("user", {}).get("login", "unknown")
            pr_body = meta_data.get("body") or ""
            
            # Fetch Raw Diff Text
            diff_headers = {**headers, "Accept": "application/vnd.github.v3.diff"}
            diff_resp = await client.get(detail_url, headers=diff_headers, timeout=15.0)
            if diff_resp.status_code != 200:
                raise HTTPException(status_code=diff_resp.status_code, detail=f"Failed to fetch PR diff from GitHub: {diff_resp.text}")
            
            git_diff = diff_resp.text
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error connecting to GitHub API: {str(e)}")
        
    # 2. Extract before/after screenshots from PR description using Regex
    image_pattern = r'!\[.*?\]\((https?://.*?)\)'
    images = re.findall(image_pattern, pr_body)
    
    if len(images) < 2:
        url_pattern = r'(https?://[^\s)]+\.(?:png|jpg|jpeg|gif))'
        found_urls = re.findall(url_pattern, pr_body)
        for url in found_urls:
            if url not in images:
                images.append(url)
                
    before_url = images[0] if len(images) > 0 else "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600"
    after_url = images[1] if len(images) > 1 else "https://images.unsplash.com/photo-1541462608141-2ff01dd914e0?w=600"
    
    # 3. Trigger the full Reviewly audit pipeline
    ai_summary = groq_service.summarize_diff(git_diff)
    visual_changes, ai_risks = gemini_service.analyze_ui_changes(
        git_diff=git_diff,
        before_url=before_url,
        after_url=after_url
    )
    final_summary = f"{ai_summary}\n\n*Visual Updates:*\n{visual_changes}"
    
    # 4. Write record to Supabase
    audit = supabase_service.create_audit(
        pr_number=pr_number,
        title=title,
        author=author,
        repository=repository,
        git_diff=git_diff,
        before_screenshot_url=before_url,
        after_screenshot_url=after_url,
        ai_summary=final_summary,
        ai_risks=ai_risks
    )
    
    if not audit:
        raise HTTPException(status_code=500, detail="Failed to record audit in Supabase.")
        
    # 5. Broadcast to Slack
    slack_service.send_pr_notification(
        audit_id=audit["id"],
        pr_number=pr_number,
        title=title,
        author=author,
        repository=repository,
        ai_summary=final_summary,
        ai_risks=ai_risks,
        portal_base_url="http://localhost:5173"
    )
    
    return {"status": "success", "audit": audit}
