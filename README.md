# Insight - AI-Powered Data Analytics Platform

Insight is a full-stack analytics application that transforms raw CSV files into cleaned datasets, statistical outputs, visual summaries, and AI-generated business insights. The system combines a FastAPI backend pipeline with a Next.js frontend dashboard to provide an end-to-end analytics workflow for non-technical and technical users.

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Backend Documentation (FastAPI)](#5-backend-documentation-fastapi)
6. [Frontend Documentation](#6-frontend-documentation)
7. [Installation and Local Development](#7-installation-and-local-development)
8. [Environment Variables](#8-environment-variables)
9. [Deployment](#9-deployment)
10. [Security Considerations](#10-security-considerations)
11. [Error Handling and Debugging](#11-error-handling-and-debugging)
12. [Performance and Scalability](#12-performance-and-scalability)
13. [Future Improvements](#13-future-improvements)
14. [Contributing](#14-contributing)
15. [License](#15-license)

---

## 1. Project Overview

### What the project does

Insight provides a browser-based interface for uploading CSV datasets and running an automated analytics pipeline:

- CSV validation and ingestion
- Data cleaning (duplicates, missing values, ID-like columns)
- Exploratory statistics and correlation analysis
- Preview generation for quick inspection
- AI-generated interpretation and recommendations
- Downloadable cleaned CSV and JSON analysis report

### Problem it solves

Many teams spend significant time on repetitive data preparation and first-pass analytics before reaching actionable insights. Insight reduces this manual overhead by standardizing and automating the full early-stage analytics lifecycle.

### Target users and use cases

- Business analysts who need rapid exploratory insights
- Operations teams that receive recurring CSV exports
- Product and growth teams validating hypotheses quickly
- Recruiters and reviewers evaluating full-stack/data-engineering work
- Developers requiring a reusable analytics pipeline baseline

### High-level system summary

- The frontend (Next.js) provides the upload and results UX.
- The backend (FastAPI) executes validation, cleaning, analytics, and insight generation.
- LLM support is provider-driven (Google Gemini preferred, Ollama fallback).
- Processed artifacts are stored in `backend/outputs` and exposed through download endpoints.

---

## 2. Architecture

### Architectural style

The platform uses a decoupled client-server architecture:

- Presentation layer: Next.js App Router frontend
- Application/API layer: FastAPI service
- Processing layer: Pandas-based analytics pipeline
- Intelligence layer: LLM-backed insight generation
- Artifact layer: filesystem-backed analysis outputs

### Component responsibilities

#### Frontend (Next.js)

- Handles CSV file selection and upload trigger
- Displays analysis lifecycle progress and status
- Renders tabs for preprocessing, statistics, charts, and insights
- Generates direct download links for backend artifacts
- Surfaces API errors and quota-related messaging

#### Backend (FastAPI)

- Exposes health, analyze, and download APIs
- Validates file type and size constraints
- Executes data pipeline functions (`load_and_validate`, `clean_dataframe`, `analyze_dataframe`)
- Calls LLM insight generation (`generate_insights_dynamic`)
- Persists cleaned CSV/report JSON for retrieval
- Runs optional cleanup for stale artifacts

#### External services

- Google Gemini API (if `GOOGLE_API_KEY` is configured)
- Ollama local runtime (fallback path)
- Render (backend deployment target)
- Vercel (frontend deployment target)

### Data flow

1. User uploads a CSV from the frontend dashboard.
2. Frontend sends multipart form data to `POST /analyze/`.
3. Backend writes input CSV to `outputs/{analysis_id}_input.csv`.
4. Data pipeline loads and validates constraints (row/column limits, emptiness).
5. Cleaning stage removes duplicates, handles missing values, and drops ID-like columns.
6. Analysis stage computes descriptive statistics, correlation matrix, and top correlation pairs.
7. LLM stage generates structured insight JSON.
8. Backend saves cleaned CSV and full report JSON.
9. API response returns analysis payload + download URLs.
10. Frontend renders results and enables artifact download actions.

---

## 3. Tech Stack

| Layer | Technology | Why it was chosen |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Production-grade React framework with optimized build/runtime pipeline |
| UI library | React 18 | Mature component model and ecosystem |
| Styling | Tailwind CSS | Fast, consistent utility-first styling for dashboard UI |
| Icons | lucide-react | Lightweight, modern icon set |
| HTTP client | Axios | Reliable request handling and structured error responses |
| Charting | Recharts | Declarative chart rendering in React |
| Report generation | jsPDF | Client-side report export flexibility |
| Backend framework | FastAPI | High-performance async API framework with automatic schema tooling |
| ASGI server | Uvicorn | Standard, performant FastAPI runtime |
| Data processing | Pandas | Robust tabular transformation and statistics operations |
| File upload handling | python-multipart | Native multipart/form-data support for CSV ingest |
| Config management | python-dotenv | Environment-driven configuration for local/prod consistency |
| LLM orchestration | LangChain + provider SDKs | Unified abstraction over Gemini/Ollama model calls |
| Deployment (backend) | Render | Fast setup for Python web services with env var support |
| Deployment (frontend) | Vercel | Native Next.js hosting and CI/CD integration |

---

## 4. Project Structure

### Directory tree

```text
.
├── .env
├── .env.example
├── .gitignore
├── assts/
│   ├── 00_START_HERE.md
│   ├── bmw_global_sales_2018_2025.csv
│   ├── DELIVERABLES.md
│   ├── DELIVERY_SUMMARY.md
│   ├── DEPLOYMENT_REPORT.md
│   ├── notes.txt
│   ├── PACKAGE_COMPLETE.txt
│   ├── PRE_DEPLOYMENT_CHECKLIST.md
│   ├── QUICK_START_DEPLOYMENT.md
│   ├── README_DEPLOYMENT_INDEX.md
│   ├── RENDER_DEPLOYMENT.md
│   └── VERCEL_DEPLOYMENT.md
├── backend/
│   ├── .env.example
│   ├── data_pipeline.py
│   ├── data_tools.py
│   ├── main.py
│   ├── main_production.py
│   ├── requirements.txt
│   ├── temp.csv
│   ├── tools.py
│   ├── utils.py
│   └── outputs/               # runtime-generated artifacts
├── frontend/
│   ├── .env.example
│   ├── .env.local
│   ├── .gitignore
│   ├── app/
│   │   ├── app/
│   │   │   └── page.js
│   │   ├── layout.js
│   │   └── page.js
│   ├── components/
│   │   ├── Charts.js
│   │   ├── DataTable.js
│   │   ├── InsightsView.js
│   │   ├── Pipeline.js
│   │   ├── Preprocessing.js
│   │   ├── ReportsView.js
│   │   ├── Sidebar.js
│   │   ├── Statistics.js
│   │   ├── Tabs.js
│   │   └── UploadCard.js
│   ├── lib/
│   │   └── api.js
│   ├── next.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── styles/
│   │   └── globals.css
│   └── tailwind.config.js
└── package-lock.json
```

### Folder and file purpose

- `backend/main.py`: baseline FastAPI entrypoint.
- `backend/main_production.py`: production-hardened FastAPI entrypoint with logging, limits, and cleanup behavior.
- `backend/data_pipeline.py`: core validation, cleaning, and statistical analysis logic.
- `backend/utils.py`: LLM prompt orchestration and JSON extraction/fallback handling.
- `backend/outputs/`: generated input snapshots, cleaned CSV, and report JSON files.
- `frontend/app/page.js`: marketing/landing page.
- `frontend/app/app/page.js`: main analytics dashboard UI.
- `frontend/lib/api.js`: centralized API endpoints and request helper utilities.
- `assts/*.md`: deployment, delivery, and operational documentation.

---

## 5. Backend Documentation (FastAPI)

### API structure and routing

The backend exposes four primary routes:

- `GET /health/`
- `POST /analyze/`
- `GET /download/cleaned/{analysis_id}`
- `GET /download/report/{analysis_id}`

The service is initialized with CORS middleware and environment-driven runtime options.

### Middleware

CORS is configured with:

- Allowed origins from `CORS_ORIGINS` (comma-separated)
- Credentials enabled
- Methods: `GET`, `POST`, `OPTIONS` (production entrypoint)
- Headers: wildcard

### Endpoint documentation

#### 1) Health check

- Method: `GET`
- Path: `/health/`
- Request body: none
- Response example:

```json
{
  "status": "ok",
  "service": "insight-backend",
  "llm": "connected",
  "version": "1.0.0"
}
```

#### 2) Analyze CSV

- Method: `POST`
- Path: `/analyze/`
- Content type: `multipart/form-data`
- Form field: `file` (must be `.csv`)

Request example:

```bash
curl -X POST http://127.0.0.1:8000/analyze/ \
  -F "file=@sample.csv"
```

Response includes:

- `analysis_id`
- cleaned dataset shape
- dataset metadata (`rows`, `columns`, column names)
- cleaning report
- statistics summary
- correlations matrix + top pairs
- preview rows
- AI insights
- download URLs

Representative response (truncated):

```json
{
  "analysis_id": "2e02d8b3-212a-42e3-b259-e6d0d04b302c",
  "shape": [1000, 12],
  "dataset": {
    "rows": 1000,
    "columns": 12,
    "column_names": ["region", "sales", "margin"]
  },
  "cleaning_report": {
    "duplicates_removed": 3,
    "missing_before": 42,
    "missing_after": 0
  },
  "download_urls": {
    "cleaned_csv": "/download/cleaned/2e02d8b3-212a-42e3-b259-e6d0d04b302c",
    "report_json": "/download/report/2e02d8b3-212a-42e3-b259-e6d0d04b302c"
  }
}
```

#### 3) Download cleaned CSV

- Method: `GET`
- Path: `/download/cleaned/{analysis_id}`
- Response type: `text/csv`
- Behavior: returns file if exists, else `404`

#### 4) Download report JSON

- Method: `GET`
- Path: `/download/report/{analysis_id}`
- Response type: `application/json`
- Behavior: returns file if exists, else `404`

### Error handling

Backend maps errors to HTTP status codes:

| Status | Trigger |
|---|---|
| `400` | invalid CSV type, dataset validation failures (empty/too large/too wide), custom `ValueError` |
| `404` | requested artifact does not exist |
| `413` | uploaded file exceeds configured max size |
| `500` | unexpected processing or runtime failure |

Error response format:

```json
{
  "detail": "Only CSV uploads are supported"
}
```

---

## 6. Frontend Documentation

### Framework and architecture

Frontend is implemented with Next.js App Router and client-side React components.

- Landing page: `frontend/app/page.js`
- Analytics dashboard: `frontend/app/app/page.js`
- Shared API layer: `frontend/lib/api.js`

### API call handling

`frontend/lib/api.js` centralizes all API interaction:

- `analyzeCsvFile(file)` posts multipart data to `/analyze/`
- `downloadCleanedUrl(analysisId)` builds cleaned-file URL
- `downloadReportUrl(analysisId)` builds report URL
- Quota/rate-limit signal detection normalizes related API errors

### State management

State is local and React-hook based (`useState`, `useMemo`) in dashboard scope.

Tracked states include:

- selected file
- loading status
- active tab/page
- pipeline step progression
- current analysis payload
- user-visible errors
- dataset history list

No external state container (Redux/Zustand) is currently used.

### Environment configuration

Frontend runtime depends on:

- `NEXT_PUBLIC_API_URL` (public browser-available variable)

If unset, fallback defaults to `http://127.0.0.1:8000`.

---

## 7. Installation and Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm 9+

### 1) Clone repository

```bash
git clone https://github.com/engalaagabr/Insight.git
cd "Insight"
```

### 2) Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create backend environment file:

```bash
cp .env.example ../.env
# then edit ../.env with your values
```

Run backend (development):

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Run backend (production-like locally):

```bash
uvicorn main_production:app --host 0.0.0.0 --port 8000
```

### 3) Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
# edit .env.local if needed
npm run dev
```

Frontend dev URL: `http://localhost:3000`

### 4) Local integration test

- Open frontend URL.
- Upload a valid CSV.
- Verify analysis renders and download links return files.

---

## 8. Environment Variables

### Required and optional variables

| Variable | Scope | Required | Default | Purpose |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | Yes (for non-default setups) | `http://localhost:8000` | Backend base URL used by browser requests |
| `CORS_ORIGINS` | Backend | Yes in production | `http://localhost:3000` | Allowed frontend origins (comma-separated) |
| `LOG_LEVEL` | Backend | Recommended | `INFO` | Backend logging verbosity |
| `MAX_FILE_SIZE_MB` | Backend | Recommended | `50` | Maximum upload size (MB) |
| `OUTPUT_DIR` | Backend | Recommended | `outputs` | Artifact output folder |
| `CLEANUP_HOURS` | Backend | Recommended | `24` | Age threshold for artifact cleanup |
| `GOOGLE_API_KEY` | Backend | Optional but recommended | empty | Enables Gemini insight generation |
| `OPENAI_API_KEY` | Backend | Optional (reserved) | empty | Reserved for alternative provider wiring |
| `ANTHROPIC_API_KEY` | Backend | Optional (reserved) | empty | Reserved for alternative provider wiring |
| `UVICORN_HOST` | Backend | Optional | `0.0.0.0` | Host bind target (deployment/runtime) |
| `UVICORN_PORT` | Backend | Optional | `10000` | Backend service port |

### Root `.env.example`

```env
# === BACKEND CONFIGURATION ===
UVICORN_HOST=0.0.0.0
UVICORN_PORT=10000
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO

# === API KEYS ===
GOOGLE_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# === FRONTEND CONFIGURATION ===
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Frontend `.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 9. Deployment

### Deployment topology

- Backend: Render Web Service
- Frontend: Vercel Project

### Backend deployment (Render)

1. Create a new Render Web Service connected to the repository.
2. Set runtime/build/start:

```text
Environment: Python 3.11
Build Command: pip install -r backend/requirements.txt
Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port 10000
```

Recommended hardened variant:

```text
Start Command: cd backend && uvicorn main_production:app --host 0.0.0.0 --port 10000
```

3. Configure environment variables in Render:

```env
GOOGLE_API_KEY=<your_key>
CORS_ORIGINS=https://<your-vercel-domain>
LOG_LEVEL=INFO
MAX_FILE_SIZE_MB=50
OUTPUT_DIR=outputs
CLEANUP_HOURS=24
```

4. Validate with health endpoint:

```bash
curl https://<your-render-domain>/health/
```

### Frontend deployment (Vercel)

1. Import repository into Vercel.
2. Set project root directory to `frontend/`.
3. Configure environment variable:

```env
NEXT_PUBLIC_API_URL=https://<your-render-domain>
```

4. Build and deploy (Vercel defaults are compatible):

```text
Install Command: npm install
Build Command: npm run build
Start Command: npm run start
```

5. Open deployed frontend and execute CSV upload verification.

### Post-deployment integration checklist

- Backend `/health/` returns `ok`
- Frontend can call `/analyze/`
- No browser CORS errors
- Download endpoints return generated artifacts

---

## 10. Security Considerations

- Do not commit real API keys to version control.
- Use platform-managed encrypted env vars (Render/Vercel settings).
- Restrict `CORS_ORIGINS` to explicit trusted domains.
- Keep `allow_origins=["*"]` out of production.
- Enforce upload constraints (file type and size).
- Avoid logging raw sensitive dataset content or secrets.
- Rotate keys immediately if any credential is exposed.

---

## 11. Error Handling and Debugging

### Common issues and resolutions

| Issue | Likely cause | Resolution |
|---|---|---|
| `400 Only CSV uploads are supported` | wrong extension/content | upload valid `.csv` file |
| `413 File size exceeds limit` | file too large | increase `MAX_FILE_SIZE_MB` or reduce file |
| Browser CORS error | frontend origin not allowed | update backend `CORS_ORIGINS` |
| `500 Internal server error during analysis` | processing or LLM failure | inspect backend logs; retry with smaller clean CSV |
| Quota exceeded message in UI | provider throttling | wait/retry, switch LLM provider, or raise quota |
| Download endpoint `404` | invalid/stale `analysis_id` | rerun analysis and use current ID |

### Logs and troubleshooting workflow

1. Check backend service logs for request-level traces and stack messages.
2. Validate `/health/` first to isolate infra vs. pipeline issues.
3. Reproduce with small deterministic CSV to narrow pipeline failures.
4. Confirm frontend `NEXT_PUBLIC_API_URL` points to the correct backend.
5. Verify artifact cleanup window (`CLEANUP_HOURS`) is not too aggressive.

---

## 12. Performance and Scalability

### Current limitations

- File-based artifact storage is ephemeral in many PaaS free tiers.
- In-memory Pandas processing can be memory intensive for large datasets.
- Single-process backend limits parallel throughput under heavy load.
- LLM latency and provider quotas affect end-to-end response times.

### Potential bottlenecks

- Large CSV parse/cleaning operations
- Correlation matrix computation on wide datasets
- Synchronous artifact I/O under concurrent load
- External LLM response time and retries

### Scalability improvements

- Move artifacts to object storage (S3-compatible bucket).
- Add async job queue (Celery/RQ + Redis) for long-running analyses.
- Add request-level caching for repeated analyses.
- Introduce worker autoscaling and CPU/memory tuning.
- Support chunked ingestion (Dask/Polars/Spark path for larger data).

---

## 13. Future Improvements

- Authentication/authorization and per-user workspaces
- Persistent analysis history in relational or document database
- Dataset lineage and reproducibility metadata
- Schema profiling and data quality scoring dashboard
- Background task execution with progress polling/websockets
- Richer visualization suite and custom report templates
- Provider abstraction completion for OpenAI/Anthropic fallback execution
- Automated unit/integration test suite and CI quality gates

---

## 14. Contributing

Contributions are welcome and should follow a predictable engineering workflow.

### Contribution process

1. Fork repository.
2. Create a feature branch.
3. Implement changes with tests where applicable.
4. Run local validation (backend + frontend build/test).
5. Submit pull request with:
   - problem statement
   - implementation summary
   - test evidence
   - screenshots (for UI changes)

### Recommended standards

- Keep changes scoped and atomic.
- Use explicit commit messages.
- Preserve environment-variable-based configuration.
- Avoid introducing hardcoded secrets, URLs, or credentials.

---

## 15. License

No `LICENSE` file is currently present in the repository.

Until a license is explicitly added by the project owner, treat this codebase as **all rights reserved**.

For open-source distribution, add a license file (for example, MIT, Apache-2.0, or GPL) and update this section accordingly.
