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

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "deepseek-ai/deepseek-r1-distill-qwen-32b"

def call_llm(prompt: str) -> Optional[str]:
    if not NVIDIA_API_KEY:
        logger.error("NVIDIA_API_KEY not found in environment.")
        return None

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": "You are an autonomous SRE fixing broken CI pipelines. Return exactly one JSON block containing the fields 'file_path' and 'new_content'. 'new_content' must be the complete, fixed file contents. Do not wrap the JSON in Markdown formatting (no ```json). Be precise."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.6,
        "top_p": 0.7,
        "max_tokens": 4096
    }

    req = urllib.request.Request(NVIDIA_URL, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except urllib.error.URLError as e:
        logger.error(f"Failed to call NVIDIA API: {e}")
        if hasattr(e, 'read'):
            logger.error(e.read().decode('utf-8'))
        return None


import re

def extract_file_contexts(ci_logs: str) -> str:
    """Extracts mentioned files from logs and appends their contents."""
    pattern = r"([a-zA-Z0-9_\-\./]+\.(?:py|js|jsx|ts|tsx|ya?ml))"
    matches = re.findall(pattern, ci_logs)
    
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    unique_files = set()
    for match in matches:
        clean_match = match.split("NightOwl-SRE-Platform/")[-1] if "NightOwl-SRE-Platform" in match else match
        # Clean paths that start with '/' or './'
        if clean_match.startswith("/"):
            clean_match = clean_match[1:]
        elif clean_match.startswith("./"):
            clean_match = clean_match[2:]
            
        full_path = os.path.join(repo_root, clean_match)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            unique_files.add(clean_match)
            
    if not unique_files:
        return "No specific code files identified in the logs."
        
    context_str = "### ACTUAL FILE CONTENTS ###\n\n"
    for file_path in unique_files:
        full_path = os.path.join(repo_root, file_path)
        try:
            with open(full_path, "r") as f:
                content = f.read()
            context_str += f"--- {file_path} ---\n```\n{content}\n```\n\n"
        except Exception as e:
            logger.warning(f"Could not read {file_path}: {e}")
            
    return context_str

def run_autofix(ci_logs: str) -> bool:
    logger.info("Analyzing CI logs to generate fix...")
    file_contexts = extract_file_contexts(ci_logs)
    
    prompt = f"""The following CI pipeline failed:

{ci_logs}

{file_contexts}

CRITICAL RULES:
1. You may ONLY modify files that are listed in the 'ACTUAL FILE CONTENTS' section above.
2. You are STRICTLY FORBIDDEN from generating new configuration files (like tox.ini, .flake8).
3. Identify the exact file that caused the failure, fix the error, and return the ENTIRE fixed file.
"""
    
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
    validation = validate_code(new_content, file_path)
    
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
