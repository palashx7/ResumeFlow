import time
import uuid
import sys
from celery_worker import celery_app

print("Sending 5 dummy tasks to Celery...")
for i in range(5):
    job_id = str(uuid.uuid4())
    res = celery_app.send_task("app.workers.resume_processor.process_resume", args=[job_id])
    print(f"Dispatched {job_id}, Task ID: {res.id}, State: {res.state}")

print("Done dispatching.")
