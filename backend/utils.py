import json
import math
import numpy as np


class NumpyEncoder(json.JSONEncoder):
    """Custom JSON encoder for NumPy types and handling non-compliant floats"""
    def default(self, obj):
        if isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
            return int(obj)
        if isinstance(obj, (np.float64, np.float32, np.float16)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (np.bool_,)):
            return bool(obj)
        return super(NumpyEncoder, self).default(obj)


def sanitize_for_json(data):
    """Recursively replace NaN, Inf, and -Inf with None for JSON compliance"""
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(v) for v in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
    elif isinstance(data, (np.float64, np.float32, np.float16)):
        if np.isnan(data) or np.isinf(data):
            return None
        return float(data)
    elif isinstance(data, (np.int64, np.int32, np.int16, np.int8)):
        return int(data)
    return data


# ---------------- ROBUST JSON PARSER ----------------
def _extract_json(text):
    try:
        return json.loads(text)
    except:
        import re
        matches = re.findall(r"\{.*\}", text, re.DOTALL)
        for m in matches:
            try:
                return json.loads(m)
            except:
                continue
    return None


# ---------------- MAIN FUNCTION ----------------
def generate_insights_dynamic(llm, analysis):

    prompt = f"""
You are a senior data analyst with strong business intuition.

Your job is to deeply analyze the dataset and generate meaningful, non-generic insights.

IMPORTANT:
- Think step by step internally
- Focus on patterns, relationships, and business meaning
- Avoid generic statements like "data was analyzed successfully"
- Be specific and insightful

Return ONLY valid JSON (no text outside JSON)

JSON FORMAT:
{{
  "executive_summary": "Deep high-level explanation of dataset behavior",
  "key_findings": ["Important discoveries from data"],
  "relationships": ["Explain correlations and interactions between variables"],
  "trends": ["Observed patterns over distributions or time"],
  "anomalies": ["Outliers or suspicious patterns and why they matter"],
  "business_insights": ["What this means in real-world/business terms"],
  "recommendations": ["Actionable steps based on the data"],
  "next_steps": ["Advanced analysis ideas or modeling suggestions"]
}}

DATA ANALYSIS:
{json.dumps(analysis, ensure_ascii=False, cls=NumpyEncoder)}
"""

    try:
        result = llm.invoke(prompt)
        content = result.content if hasattr(result, "content") else str(result)

        parsed = _extract_json(content)

        if parsed:
            parsed["raw_text"] = content
            return parsed

    except Exception as e:
        print("LLM error:", e)

    # fallback minimal (NOT static-heavy)
    return {
        "executive_summary": "Unable to generate deep insights from model.",
        "key_findings": [],
        "relationships": [],
        "trends": [],
        "anomalies": [],
        "business_insights": [],
        "recommendations": [],
        "next_steps": [],
        "raw_text": "Fallback triggered"
    }