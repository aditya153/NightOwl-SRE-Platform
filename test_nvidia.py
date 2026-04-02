import urllib.request, json
headers = {"Authorization": "Bearer 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", "Content-Type": "application/json", "Accept": "application/json"}
data = {"model": "deepseek-ai/deepseek-r1-distill-qwen-32b", "messages": [{"role": "user", "content": "hi"}], "max_tokens": 100}
try:
    req = urllib.request.Request("https://integrate.api.nvidia.com/v1/chat/completions", data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    print(urllib.request.urlopen(req).read().decode())
except Exception as e:
    import sys
    print(str(e))
    # print traceback
    import traceback
    traceback.print_exc()
    sys.exit(1)
