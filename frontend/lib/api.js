import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/analyze/`,
  HEALTH: `${API_BASE_URL}/health/`,
  DOWNLOAD_CLEANED: (analysisId) => `${API_BASE_URL}/download/cleaned/${analysisId}`,
  DOWNLOAD_REPORT: (analysisId) => `${API_BASE_URL}/download/report/${analysisId}`,
};

const QUOTA_EXCEEDED_MESSAGE = "API quota exceeded. Try later.";

function hasQuotaLimitSignal(payload, statusCode) {
  if (statusCode === 429) return true;
  const haystack = String(payload || "").toLowerCase();
  return (
    haystack.includes("quota exceeded")
    || haystack.includes("rate limit")
    || haystack.includes("resourceexhausted")
  );
}

export async function analyzeCsvFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await axios.post(API_ENDPOINTS.ANALYZE, formData);
    if (hasQuotaLimitSignal(JSON.stringify(response?.data), response?.status)) {
      throw new Error(QUOTA_EXCEEDED_MESSAGE);
    }
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const responseText = JSON.stringify(error?.response?.data || "");
    const messageText = String(error?.message || "");
    if (hasQuotaLimitSignal(`${responseText} ${messageText}`, status)) {
      throw new Error(QUOTA_EXCEEDED_MESSAGE);
    }
    throw error;
  }
}

export function downloadCleanedUrl(analysisId) {
  return API_ENDPOINTS.DOWNLOAD_CLEANED(analysisId);
}

export function downloadReportUrl(analysisId) {
  return API_ENDPOINTS.DOWNLOAD_REPORT(analysisId);
}

export default API_BASE_URL;
