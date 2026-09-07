FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for building psycopg and semgrep later
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install semgrep cryptography

COPY . .

# Set up rules directory
ENV SEMGREP_RULES_DIR=/app/rules

CMD ["celery", "-A", "app.celery_app", "worker", "--loglevel=info"]
