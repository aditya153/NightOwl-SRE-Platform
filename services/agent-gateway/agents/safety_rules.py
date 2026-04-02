import re


DANGEROUS_PATTERNS = [
    {
        "id": "OWASP-SECRETS-001",
        "name": "Hardcoded Secrets",
        "pattern": r"(password|secret|api_key|token|private_key)\s*=\s*['\"][^'\"]{8,}['\"]",
        "severity": "CRITICAL",
        "description": "Hardcoded credentials detected. Use environment variables instead.",
    },
    {
        "id": "OWASP-NETWORK-001",
        "name": "Exposed Sensitive Ports",
        "pattern": r"0\.0\.0\.0:(22|3306|5432|6379|27017|9200)",
        "severity": "CRITICAL",
        "description": "Sensitive service port exposed to all interfaces.",
    },
    {
        "id": "OWASP-DB-001",
        "name": "Destructive Database Operations",
        "pattern": r"(DROP\s+(TABLE|DATABASE)|TRUNCATE\s+TABLE|DELETE\s+FROM\s+\w+\s*;)",
        "severity": "CRITICAL",
        "description": "Destructive database operation without WHERE clause or safeguards.",
    },
    {
        "id": "OWASP-INPUT-001",
        "name": "Unvalidated Input in SQL",
        "pattern": r"(execute|cursor\.execute)\s*\(\s*f['\"]",
        "severity": "HIGH",
        "description": "F-string used in SQL query. Use parameterized queries to prevent injection.",
    },
    {
        "id": "OWASP-EXEC-001",
        "name": "Arbitrary Code Execution",
        "pattern": r"(eval|exec|os\.system|subprocess\.call)\s*\(",
        "severity": "HIGH",
        "description": "Potential arbitrary code execution detected.",
    },
    {
        "id": "OWASP-RACE-001",
        "name": "Race Condition Pattern",
        "pattern": r"(time\.sleep\s*\(\s*0\s*\)|threading\._start_new_thread)",
        "severity": "MEDIUM",
        "description": "Pattern associated with race conditions detected.",
    },
    {
        "id": "OWASP-PRIV-001",
        "name": "Privilege Escalation",
        "pattern": r"(chmod\s+777|chown\s+root|sudo\s+)",
        "severity": "HIGH",
        "description": "Privilege escalation or overly permissive file permissions detected.",
    },
    {
        "id": "OWASP-DEBUG-001",
        "name": "Debug Mode in Production",
        "pattern": r"(DEBUG\s*=\s*True|debug\s*=\s*true|\.run\(debug=True\))",
        "severity": "MEDIUM",
        "description": "Debug mode enabled. Disable before deploying to production.",
    },
]


def validate_code(code_content: str, file_path: str = "") -> dict:
    violations = []

    if file_path:
        filename = file_path.split("/")[-1].lower()
        forbidden_configs = ["tox.ini", "pyproject.toml", ".flake8", "pytest.ini", "package.json", ".eslintrc", ".env", "requirements.txt"]
        if filename in forbidden_configs or not file_path.endswith((".py", ".js", ".jsx", ".ts", ".tsx")):
            violations.append({
                "rule_id": "OWASP-CONFIG-001",
                "name": "Forbidden Configuration Modification",
                "severity": "CRITICAL",
                "description": f"AI is strictly forbidden from creating or modifying configuration files like '{filename}'.",
                "match_count": 1,
            })

    for rule in DANGEROUS_PATTERNS:
        matches = re.findall(rule["pattern"], code_content, re.IGNORECASE | re.MULTILINE)
        if matches:
            violations.append({
                "rule_id": rule["id"],
                "name": rule["name"],
                "severity": rule["severity"],
                "description": rule["description"],
                "match_count": len(matches),
            })

    is_safe = all(v["severity"] != "CRITICAL" for v in violations)

    return {
        "is_safe": is_safe,
        "violations": violations,
        "total_violations": len(violations),
        "critical_count": sum(1 for v in violations if v["severity"] == "CRITICAL"),
        "high_count": sum(1 for v in violations if v["severity"] == "HIGH"),
        "medium_count": sum(1 for v in violations if v["severity"] == "MEDIUM"),
    }


def validate_fix_diff(diff_content: str) -> dict:
    added_lines = []
    for line in diff_content.split("\n"):
        if line.startswith("+") and not line.startswith("+++"):
            added_lines.append(line[1:])

    new_code = "\n".join(added_lines)
    result = validate_code(new_code)
    result["scope"] = "diff_additions_only"
    return result
