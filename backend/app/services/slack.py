import httpx
from app.core.config import settings
from typing import Dict, Any, Optional

class SlackService:
    def __init__(self):
        self.webhook_url = settings.SLACK_WEBHOOK_URL

    def send_pr_notification(
        self,
        audit_id: str,
        pr_number: int,
        title: str,
        author: str,
        repository: str,
        ai_summary: str,
        ai_risks: str,
        portal_base_url: str = "http://localhost:5173"
    ) -> bool:
        """
        Sends an interactive message card to Slack via incoming webhook.
        """
        if not self.webhook_url:
            print("Slack webhook URL not configured, skipping notification.")
            return False

        # Format portal review URL
        review_url = f"{portal_base_url.rstrip('/')}/review/{audit_id}"

        # Clean strings to prevent Slack markdown breaks
        safe_summary = ai_summary if ai_summary else "No changes described."
        safe_risks = ai_risks if ai_risks else "No critical UX risks identified."

        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "🔍 Reviewly Visual Audit Triggered",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Repository:*\n{repository}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*PR Number:*\n#{pr_number} - {title}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Author:*\n{author}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Status:*\n`Pending Review`"
                        }
                    ]
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*AI Code & Visual Summary:*\n{safe_summary}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*⚠️ Highlighted UX Risks:*\n{safe_risks}"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Open Web Portal",
                                "emoji": True
                            },
                            "style": "primary",
                            "url": review_url
                        }
                    ]
                }
            ]
        }

        try:
            response = httpx.post(self.webhook_url, json=payload, timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            print(f"Error sending Slack notification: {str(e)}")
            return False

slack_service = SlackService()
