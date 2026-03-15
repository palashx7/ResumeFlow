#!/bin/bash

# Start Redis locally in the background
redis-server --daemonize yes

# Wait for Redis to boot
sleep 2

# Start the Celery Worker in the background
celery -A celery_worker worker --loglevel=info &

# Start the FastAPI web server in the foreground (Render needs this bounded to $PORT)
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
