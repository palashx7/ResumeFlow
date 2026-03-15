# Distributed Resume Processing Pipeline

A scalable backend system that processes large batches of resumes asynchronously using a distributed job queue architecture. Upload resumes, and workers automatically parse PDFs, extract skills, generate embeddings, and rank candidates against job descriptions.

## Architecture

```
User → Frontend (Next.js) → API (FastAPI) → Redis Queue → Workers (Celery) → PostgreSQL
```

## Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | Next.js, React, Tailwind CSS   |
| Backend    | Python, FastAPI                |
| Queue      | Redis, Celery                  |
| Database   | PostgreSQL                     |
| AI/NLP     | sentence-transformers          |
| Deployment | Docker, Docker Compose         |

## Quick Start

### With Docker (Recommended)

```bash
# Clone and start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
cp .env.example .env         # Edit with your config
uvicorn main:app --reload
```

#### Celery Worker

```bash
cd backend
celery -A celery_worker worker --loglevel=info --concurrency=4
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

> **Requirements:** Redis and PostgreSQL must be running locally.

## API Endpoints

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | `/auth/register`      | Register new user      |
| POST   | `/auth/login`         | Login & get JWT        |
| GET    | `/auth/me`            | Get current user       |
| POST   | `/resumes/upload`     | Upload resumes (PDFs)  |
| GET    | `/jobs`               | List user's jobs       |
| GET    | `/jobs/stats`         | Job statistics         |
| GET    | `/candidates/ranking` | Ranked candidates      |

## Processing Pipeline

1. **PDF Parsing** — Extract text using `pdfplumber`
2. **Text Cleaning** — Remove artifacts, special characters
3. **Skill Extraction** — Dictionary-based matching (150+ skills)
4. **Embedding Generation** — `all-MiniLM-L6-v2` sentence transformer
5. **Job Matching** — Cosine similarity scoring
6. **Store Results** — Save candidate with skills & score

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routes
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Processing pipeline
│   │   ├── workers/      # Celery tasks
│   │   └── utils/        # JWT, hashing
│   ├── main.py           # App entry point
│   ├── celery_worker.py  # Celery config
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # Navbar, etc.
│   │   └── services/     # API client
│   └── Dockerfile
└── docker-compose.yml
```

## Features

- **JWT Authentication** — Secure register/login flow
- **Batch Upload** — Upload multiple PDFs at once
- **Real-time Job Tracking** — Auto-refreshing status updates
- **AI-Powered Matching** — Semantic similarity with sentence transformers
- **Failure Handling** — Automatic retries with exponential backoff (max 3)
- **Candidate Ranking** — Sorted by match score with skill extraction
- **Scalable Workers** — Add more Celery workers for parallel processing
