import json
import os
import uuid
import shutil
from pathlib import Path

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

app = FastAPI()

ROOT_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ROOT_ENV_PATH)

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _initialize_llm():
    google_api_key = os.getenv("GOOGLE_API_KEY", "").strip()

    if google_api_key and ChatGoogleGenerativeAI is not None:
        try:
            return ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key)
        except Exception:
            pass

    try:
        return ChatOllama(model="llama3")
    except Exception:
        return None


llm = _initialize_llm()


def _validate_csv_file(file):
    filename = (file.filename or "").lower()
    if not filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported")


def _artifact_paths(analysis_id):
    cleaned_csv_path = os.path.join(OUTPUT_DIR, f"{analysis_id}_cleaned.csv")
    report_json_path = os.path.join(OUTPUT_DIR, f"{analysis_id}_report.json")
    original_csv_path = os.path.join(OUTPUT_DIR, f"{analysis_id}_input.csv")
    return original_csv_path, cleaned_csv_path, report_json_path


@app.get("/health/")
async def health():
    return {
        "status": "ok",
        "service": "insight-backend",
        "llm": "connected" if llm is not None else "unavailable",
    }


@app.post("/analyze/")
async def analyze(file: UploadFile = File(...)):
    _validate_csv_file(file)
    analysis_id = str(uuid.uuid4())
    original_csv_path, cleaned_csv_path, report_json_path = _artifact_paths(analysis_id)

    try:
        with open(original_csv_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        df = load_and_validate(original_csv_path)
        df_clean, cleaning_report = clean_dataframe(df)
        analysis = analyze_dataframe(df_clean)

        if llm is not None:
            insights = generate_insights(llm, analysis)
        else:
            insights = generate_insights(None, analysis)

        df_clean.to_csv(cleaned_csv_path, index=False)

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

        with open(report_json_path, "w", encoding="utf-8") as report_file:
            json.dump(response_payload, report_file, ensure_ascii=False, indent=2)

        return response_payload
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected analysis error: {exc}")


@app.get("/download/cleaned/{analysis_id}")
async def download_cleaned_csv(analysis_id: str):
    _, cleaned_csv_path, _ = _artifact_paths(analysis_id)
    if not os.path.exists(cleaned_csv_path):
        raise HTTPException(status_code=404, detail="Cleaned CSV not found")

    return FileResponse(
        cleaned_csv_path,
        media_type="text/csv",
        filename=f"insight_cleaned_{analysis_id}.csv",
    )


@app.get("/download/report/{analysis_id}")
async def download_report_json(analysis_id: str):
    _, _, report_json_path = _artifact_paths(analysis_id)
    if not os.path.exists(report_json_path):
        raise HTTPException(status_code=404, detail="Analysis report not found")

    return FileResponse(
        report_json_path,
        media_type="application/json",
        filename=f"insight_report_{analysis_id}.json",
    )