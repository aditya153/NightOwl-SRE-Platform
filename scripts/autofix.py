import os
import sys
import json
import logging
from typing import Dict, Optional
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from services.agent_gateway.agents.safety_rules import validate_code
except ImportError:
    # If paths get weird during CI, fallback
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services", "agent-gateway"))
    from agents.safety_rules import validate_code

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.0-flash-001"

def call_llm(prompt: str) -> Optional[str]:
    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY not found in environment.")
        return None

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/aditya153/NightOwl-SRE-Platform",
        "X-Title": "NightOwl AI Autofix"
    }

    data = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an autonomous SRE fixing broken CI pipelines. Return exactly one JSON block containing the fields 'file_path' and 'new_content'. 'new_content' must be the complete, fixed file contents. Do not wrap the JSON in Markdown formatting (no ```json). Be precise. Do not introduce security vulnerabilities or race conditions."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    req = urllib.request.Request(OPENROUTER_URL, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except urllib.error.URLError as e:
        logger.error(f"Failed to call OpenRouter API: {e}")
        if hasattr(e, 'read'):
            logger.error(e.read().decode('utf-8'))
        return None


def run_autofix(ci_logs: str) -> bool:
    logger.info("Analyzing CI logs to generate fix...")
    prompt = f"The following CI pipeline failed:\n\n{ci_logs}\n\nIdentify the issue, the file that needs fixing, and provide the entire fixed file."
    
    response = call_llm(prompt)
    if not response:
        logger.error("No response from LLM.")
        return False
        
    try:
        # Clean up any potential markdown wrapper
        if response.startswith("```json"):
            response = response.replace("```json\n", "")
            response = response.replace("\n```", "")
        if response.startswith("```"):
            response = response.replace("```\n", "").replace("\n```", "")
            
        fix_data = json.loads(response.strip())
        file_path = fix_data.get("file_path")
        new_content = fix_data.get("new_content")
        
        if not file_path or not new_content:
            logger.error("LLM did not return 'file_path' and 'new_content'.")
            return False
            
    except Exception as e:
        logger.error(f"Failed to parse LLM response: {e}\nResponse: {response}")
        return False

    logger.info(f"LLM proposed fix for: {file_path}")
    
    # Run Layer 1: OWASP Safety Rules
    logger.info("Running OWASP Safety Rules context check...")
    validation = validate_code(new_content)
    
    if not validation["is_safe"]:
        logger.error("Fix blocked by OWASP Safety Rules Engine!")
        for v in validation["violations"]:
            logger.error(f"- {v['severity']}: {v['name']} ({v['rule_id']})")
        return False
        
    logger.info("Fix passed Safety Rules. Applying...")
    
    # Apply fix
    abs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), file_path)
    try:
        with open(abs_path, "w") as f:
            f.write(new_content)
        logger.info(f"Successfully wrote fix to {abs_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to write to file {abs_path}: {e}")
        return False

if __name__ == "__main__":
    test_logs = os.getenv("CI_ERROR_LOGS", "")
    if not test_logs:
        test_logs = "flake8 testing error: services/agent-gateway/main.py:157:14: E201 whitespace after '{'"
        
    success = run_autofix(test_logs)
    sys.exit(0 if success else 1)
