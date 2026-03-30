FROM python:3.11-slim

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install the base dependencies required by the MCP servers (Github, K8s, etc.)
RUN pip install --no-cache-dir mcp kubernetes PyGithub httpx uv

COPY . .

# Set the default entrypoint to python, so you can easily run:
# docker run <image> github_server.py
ENTRYPOINT ["python"]
CMD ["github_server.py"]
