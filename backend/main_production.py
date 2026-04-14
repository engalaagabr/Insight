import json
import os
import uuid
import shutil
import logging
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from data_pipeline import load_and_validate, clean_dataframe, analyze_dataframe
from utils import generate_insights_dynamic as generate_insights

from langchain_community.chat_models import ChatOllama

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:
    ChatGoogleGenerativeAI = None

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info("FastAPI backend initializing...")

# ============================================================================
# APPLICATION INITIALIZATION
# ============================================================================
app = FastAPI(
    title="Insight API",
    description="AI-powered data analytics platform",
    version="1.0.0"
)

ROOT_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ROOT_ENV_PATH)

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)
logger.info(f"Output directory: {OUTPUT_DIR}")

# ============================================================================
# CORS CONFIGURATION (PRODUCTION-HARDENED)
# ============================================================================
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS if origin.strip()]

logger.info(f"CORS origins configured: {CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ============================================================================
# CONFIGURATION & LIMITS
# ============================================================================
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
CLEANUP_HOURS = int(os.getenv("CLEANUP_HOURS", "24"))

logger.info(f"Max file size: {MAX_FILE_SIZE_MB}MB")
logger.info(f"Auto-cleanup enabled: {CLEANUP_HOURS} hours")

# ============================================================================
# LLM INITIALIZATION
# ============================================================================
def _initialize_llm():
    """Initialize LLM with fallback chain: Google > Ollama > None"""
    google_api_key = os.getenv("GOOGLE_API_KEY", "").strip()

    if google_api_key and ChatGoogleGenerativeAI is not None:
        try:
            logger.info("Initializing Google Gemini LLM...")
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key)
        except Exception as e:
            logger.warning(f"Failed to initialize Google Gemini: {e}")

    try:
        logger.info("Initializing Ollama LLM...")
        return ChatOllama(model="llama3")
    except Exception as e:
        logger.warning(f"Failed to initialize Ollama: {e}")
        logger.warning("Running in degraded mode without LLM insights")
        return None


llm = _initialize_llm()

# ============================================================================
# FILE MANAGEMENT UTILITIES
# ============================================================================
def _validate_csv_file(file: UploadFile) -> None:
    """Validate file type and size"""
    filename = (file.filename or "").lower()
    
    if not filename.endswith(".csv"):
        logger.warning(f"Invalid file format: {filename}")
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported")
    
    # File size validation
    if file.size is not None and file.size > MAX_FILE_SIZE_BYTES:
        logger.warning(f"File too large: {file.size} bytes (max: {MAX_FILE_SIZE_BYTES})")
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds {MAX_FILE_SIZE_MB}MB limit"
        )


def _artifact_paths(analysis_id: str) -> tuple:
    """Generate artifact file paths"""
    cleaned_csv_path = os.path.join(OUTPUT_DIR, f"{analysis_id}_cleaned.csv")
    report_json_path = os.path.join(OUTPUT_DIR, f"{analysis_id}_report.json")
    original_csv_path = os.path.join(OUTPUT_DIR, f"{analysis_id}_input.csv")
    return original_csv_path, cleaned_csv_path, report_json_path


def _cleanup_old_files() -> None:
    """Remove analysis files older than CLEANUP_HOURS"""
    if CLEANUP_HOURS <= 0:
        return
    
    try:
        now = datetime.now()
        cutoff_time = now - timedelta(hours=CLEANUP_HOURS)
        
        deleted_count = 0
        for file_path in Path(OUTPUT_DIR).glob("*"):
            file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
            if file_mtime < cutoff_time:
                file_path.unlink()
                deleted_count += 1
        
        if deleted_count > 0:
            logger.info(f"Cleaned up {deleted_count} old files")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}", exc_info=True)


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health/")
async def health():
    """Health check endpoint"""
    logger.info("Health check requested")
    return {
        "status": "ok",
        "service": "insight-backend",
        "llm": "connected" if llm is not None else "unavailable",
        "version": "1.0.0"
    }


@app.post("/analyze/")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze CSV file:
    1. Validate file format and size
    2. Load and clean data
    3. Perform statistical analysis
    4. Generate AI insights
    5. Return results with download URLs
    """
    analysis_id = str(uuid.uuid4())
    logger.info(f"Analysis started: {analysis_id} (file: {file.filename})")
    
    _validate_csv_file(file)
    original_csv_path, cleaned_csv_path, report_json_path = _artifact_paths(analysis_id)

    try:
        # Save original file
        logger.debug(f"Saving original file: {original_csv_path}")
        with open(original_csv_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Load and validate
        logger.debug("Loading and validating CSV...")
        df = load_and_validate(original_csv_path)
        logger.info(f"CSV loaded: {df.shape[0]} rows, {df.shape[1]} columns")

        # Clean data
        logger.debug("Cleaning data...")
        df_clean, cleaning_report = clean_dataframe(df)
        logger.info(f"Data cleaned: {cleaning_report}")

        # Analyze
        logger.debug("Performing statistical analysis...")
        analysis = analyze_dataframe(df_clean)

        # Generate insights
        logger.debug("Generating AI insights...")
        if llm is not None:
            insights = generate_insights(llm, analysis)
        else:
            logger.info("Using fallback insights (no LLM available)")
            insights = generate_insights(None, analysis)

        # Save cleaned data
        logger.debug(f"Saving cleaned CSV: {cleaned_csv_path}")
        df_clean.to_csv(cleaned_csv_path, index=False)

        # Prepare response
        response_payload = {
            "analysis_id": analysis_id,
            "shape": [int(df_clean.shape[0]), int(df_clean.shape[1])],
            "dataset": analysis["dataset"],
            "cleaning_report": cleaning_report,
            "statistics": analysis["statistics"],
            "correlations": analysis["correlations"],
            "preview": analysis["preview"],
            "insights": insights,
            "download_urls": {
                "cleaned_csv": f"/download/cleaned/{analysis_id}",
                "report_json": f"/download/report/{analysis_id}",
            },
        }

        # Save report
        logger.debug(f"Saving report: {report_json_path}")
        with open(report_json_path, "w", encoding="utf-8") as report_file:
            json.dump(response_payload, report_file, ensure_ascii=False, indent=2)

        logger.info(f"Analysis completed successfully: {analysis_id}")
        
        # Run cleanup in background (optional)
        _cleanup_old_files()
        
        return response_payload
        
    except HTTPException:
        logger.error(f"HTTP Exception in analysis {analysis_id}")
        raise
    except ValueError as exc:
        logger.error(f"Validation error in analysis {analysis_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.error(f"Unexpected error in analysis {analysis_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during analysis")


@app.get("/download/cleaned/{analysis_id}")
async def download_cleaned_csv(analysis_id: str):
    """Download cleaned CSV file"""
    logger.info(f"Cleaned CSV download requested: {analysis_id}")
    
    _, cleaned_csv_path, _ = _artifact_paths(analysis_id)
    if not os.path.exists(cleaned_csv_path):
        logger.warning(f"Cleaned CSV not found: {analysis_id}")
        raise HTTPException(status_code=404, detail="Cleaned CSV not found")

    return FileResponse(
        cleaned_csv_path,
        media_type="text/csv",
        filename=f"insight_cleaned_{analysis_id}.csv",
    )


@app.get("/download/report/{analysis_id}")
async def download_report_json(analysis_id: str):
    """Download analysis report JSON"""
    logger.info(f"Report download requested: {analysis_id}")
    
    _, _, report_json_path = _artifact_paths(analysis_id)
    if not os.path.exists(report_json_path):
        logger.warning(f"Report not found: {analysis_id}")
        raise HTTPException(status_code=404, detail="Analysis report not found")

    return FileResponse(
        report_json_path,
        media_type="application/json",
        filename=f"insight_report_{analysis_id}.json",
    )


# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Application startup"""
    logger.info("=" * 60)
    logger.info("Insight Backend Starting Up")
    logger.info("=" * 60)
    logger.info(f"Environment: {os.getenv('ENV', 'development')}")
    logger.info(f"CORS Origins: {CORS_ORIGINS}")
    logger.info(f"Max File Size: {MAX_FILE_SIZE_MB}MB")
    logger.info(f"LLM Status: {'Connected' if llm else 'Unavailable'}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown - perform cleanup"""
    logger.info("Insight Backend Shutting Down")
    _cleanup_old_files()
