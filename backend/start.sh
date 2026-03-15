#!/bin/bash

# Start Redis locally in the background
redis-server --daemonize yes

# Wait for Redis to boot
sleep 2

# Start the Celery Worker in the background
# We MUST limit concurrency to 1 on the 512MB free tier to prevent memory forks
# We also force the worker to restart if it consumes more than 150MB of RAM
celery -A celery_worker worker --loglevel=info --concurrency=1 --max-memory-per-child=150000 &

# Start the FastAPI web server in the foreground (Render needs this bounded to $PORT)
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
