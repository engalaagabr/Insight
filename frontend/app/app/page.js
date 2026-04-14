"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertCircle, Database, Download, Loader2, Play, Table2 } from "lucide-react";

import Sidebar from "../../components/Sidebar";
import UploadCard from "../../components/UploadCard";
import DataTable from "../../components/DataTable";
import Pipeline from "../../components/Pipeline";
import Tabs from "../../components/Tabs";
import Preprocessing from "../../components/Preprocessing";
import Statistics from "../../components/Statistics";
import { analyzeCsvFile, downloadCleanedUrl, downloadReportUrl } from "../../lib/api";

const Charts = dynamic(() => import("../../components/Charts"), { ssr: false });
const InsightsView = dynamic(() => import("../../components/InsightsView"), { ssr: false });

const NAV_TABS = [
  { id: "overview", label: "Overview" },
  { id: "preprocessing", label: "Preprocessing" },
  { id: "statistics", label: "Statistics" },
  { id: "visualizations", label: "Visualizations" },
  { id: "insights", label: "Insights" },
];

function KpiCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
        <span className="w-8 h-8 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-center">
          <Icon size={14} className="text-[#6b7280]" />
        </span>
      </div>
      <p className="text-2xl font-semibold text-[#111827] mt-3">{value}</p>
    </div>
  );
}

function formatMB(bytes) {
  if (!bytes || !Number.isFinite(bytes)) return "-";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [error, setError] = useState("");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [datasetHistory, setDatasetHistory] = useState([]);

  const stats = useMemo(() => {
    if (!data) return { rows: 0, columns: 0, totalCells: 0, size: formatMB(file?.size) };

    const rows = data?.dataset?.rows || 0;
    const columns = data?.dataset?.columns || 0;

    return {
      rows,
      columns,
      totalCells: rows * columns,
      size: formatMB(file?.size),
    };
  }, [data, file]);

  const upload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setError("");
    setPipelineStep(1);

    const stageTimers = [
      setTimeout(() => setPipelineStep(2), 250),
      setTimeout(() => setPipelineStep(3), 700),
      setTimeout(() => setPipelineStep(4), 1200),
    ];

    try {
      const response = await analyzeCsvFile(file);
      setData(response);
      setPipelineStep(5);
      setActivePage("overview");

      setDatasetHistory((prev) => [
        {
          id: response.analysis_id,
          name: file.name,
          meta: `${response?.dataset?.rows || 0} rows · ${response?.dataset?.columns || 0} cols`,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Upload failed.");
      setPipelineStep(0);
    } finally {
      stageTimers.forEach((timer) => clearTimeout(timer));
      setLoading(false);
    }
  };

  const renderTab = () => {
    if (!data) {
      return (
        <section className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h2 className="text-base font-semibold text-[#111827]">No analysis results yet</h2>
          <p className="text-sm text-[#6b7280] mt-2 leading-6">
            Upload a CSV file, then click <span className="text-[#111827] font-medium">Run AI Analysis Now</span> to generate preprocessing, statistics, visualizations, and insights.
          </p>
        </section>
      );
    }

    if (activePage === "overview") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="Rows" value={stats.rows.toLocaleString()} icon={Table2} />
            <KpiCard label="Columns" value={stats.columns.toLocaleString()} icon={Table2} />
            <KpiCard label="Size" value={stats.size} icon={Database} />
            <KpiCard label="Total Cells" value={stats.totalCells.toLocaleString()} icon={Table2} />
          </div>

          <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-semibold text-[#111827]">Dataset Overview (Llama)</h2>
            <p className="text-sm text-[#6b7280] mt-2 leading-6">
              {data?.insights?.dataset_overview || "No dataset overview available yet."}
            </p>
          </section>

          <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-semibold text-[#111827]">Summary</h2>
            <p className="text-sm text-[#6b7280] mt-2 leading-6">
              {data?.insights?.executive_summary || "No summary available yet."}
            </p>
          </section>

          <section className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-wrap gap-3">
            <a
              href={downloadCleanedUrl(data.analysis_id)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] text-sm text-[#111827]"
            >
              <Download size={14} /> Cleaned CSV
            </a>
            <a
              href={downloadReportUrl(data.analysis_id)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] text-sm text-[#111827]"
            >
              <Download size={14} /> JSON Report
            </a>
          </section>

          <DataTable data={data} />
        </div>
      );
    }

    if (activePage === "preprocessing") return <Preprocessing data={data} />;
    if (activePage === "statistics") return <Statistics data={data} />;
    if (activePage === "visualizations") return <Charts data={data} />;
    if (activePage === "insights") return <InsightsView data={data} />;

    return null;
  };

  const datasetName = data ? file?.name || "Uploaded dataset" : file?.name || "No dataset selected";
  const aiHeaderSummary = data?.insights?.executive_summary || data?.insights?.dataset_overview || "Upload a CSV dataset and run analysis to generate an AI summary.";
  const aiSummaryPreview = `${String(aiHeaderSummary).slice(0, 175)}${String(aiHeaderSummary).length > 175 ? "..." : ""}`;

  return (
    <div className="flex min-h-screen bg-[#f9fafb] overflow-hidden">
      <Sidebar setPage={setActivePage} currentPage={activePage} datasetHistory={datasetHistory} />

      <main className="flex-1 ml-[240px] overflow-y-auto">
        <div className="min-h-screen p-6 lg:p-8 max-w-[1400px] space-y-6">
          <header className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="space-y-3 min-w-0">
              <h1 className="text-xl font-semibold text-[#111827]">{datasetName}</h1>
              <p className="text-sm text-[#6b7280]">Enterprise analytics workspace</p>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3.5 py-3">
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">AI Summary</p>
                <p className="text-sm text-[#111827] mt-1 leading-6">{aiSummaryPreview}</p>
              </div>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[260px] space-y-3">
              <button
                onClick={upload}
                disabled={loading || !file}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                {loading ? "Analyzing Dataset..." : "Run AI Analysis Now"}
              </button>
              <p className="text-xs text-[#6b7280]">
                {loading ? "Analysis in progress. Pipeline updates in real time." : "Select a CSV and run a full automated analytics workflow."}
              </p>
              <div className="h-1.5 rounded-full bg-[#f3f4f6] overflow-hidden border border-[#e5e7eb]">
                <div
                  className="h-full bg-[#2563eb] transition-all duration-500"
                  style={{ width: `${Math.min((pipelineStep / 5) * 100, 100)}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </header>

          <Pipeline step={pipelineStep} loading={loading} />

          <UploadCard
            setFile={(selectedFile) => {
              setFile(selectedFile);
              setError("");
            }}
            selectedFileName={file?.name || ""}
            selectedFileSize={file ? (file.size / (1024 * 1024)).toFixed(2) : ""}
          />

          <Tabs tabs={NAV_TABS} activeTab={activePage} onChange={setActivePage} />

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          {renderTab()}
        </div>
      </main>
    </div>
  );
}
