import os
import json
import httpx

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

async def send_approval_request(incident_id: str, action_plan: list) -> bool:
    if not SLACK_WEBHOOK_URL:
        return False

    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "High Severity Action Approval Required"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Incident ID:* {incident_id}\n*Proposed Fix:*\n```\n{json.dumps(action_plan, indent=2)}\n```"
            }
        },
        {
            "type": "actions",
            "block_id": "approval_actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Approve"
                    },
                    "style": "primary",
                    "value": json.dumps({"incident_id": incident_id, "action": "approve"}),
                    "action_id": "action_approve"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Deny"
                    },
                    "style": "danger",
                    "value": json.dumps({"incident_id": incident_id, "action": "deny"}),
                    "action_id": "action_deny"
                }
            ]
        }
    ]

    payload = {"blocks": blocks}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(SLACK_WEBHOOK_URL, json=payload, timeout=5.0)
            response.raise_for_status()
            return True
        except Exception:
            return False
