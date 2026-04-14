"use client";

import { ShieldCheck, Trash2, Droplets, Table2, CheckCircle2 } from "lucide-react";

function StatTile({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

export default function Preprocessing({ data }) {
  const report = data?.cleaning_report;
  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-base font-semibold text-[#111827] flex items-center gap-3">
          <ShieldCheck className="text-[#16a34a]" size={18} />
          Preprocessing Report
        </h2>
        <p className="text-sm text-[#6b7280] mt-2">Automatic validation and cleaning actions applied to your dataset</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Original Rows" value={report.original_shape?.[0] ?? 0} color="text-[#2563eb]" />
        <StatTile label="Cleaned Rows" value={report.cleaned_shape?.[0] ?? 0} color="text-[#16a34a]" />
        <StatTile label="Duplicates Removed" value={report.duplicates_removed ?? 0} color="text-[#111827]" />
        <StatTile label="Missing Values Fixed" value={(report.missing_before ?? 0) - (report.missing_after ?? 0)} color="text-[#111827]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Table2 className="text-[#2563eb]" size={16} />
            Column Operations
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-white border border-[#e5e7eb]">
              <p className="text-[#111827] font-medium">Dropped Columns ({report.dropped_columns?.length || 0})</p>
              <p className="text-[#6b7280] mt-1 break-words">{(report.dropped_columns || []).join(", ") || "None"}</p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#e5e7eb]">
              <p className="text-[#111827] font-medium">ID-like Removed ({report.id_like_columns_removed?.length || 0})</p>
              <p className="text-[#6b7280] mt-1 break-words">{(report.id_like_columns_removed || []).join(", ") || "None"}</p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#e5e7eb]">
              <p className="text-[#111827] font-medium">Converted to Numeric</p>
              <p className="text-[#6b7280] mt-1 break-words">{(report.numeric_converted_columns || []).join(", ") || "None"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Droplets className="text-[#2563eb]" size={16} />
            Missing Data Strategy
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-between">
              <span className="text-[#111827]">Missing Before</span>
              <span className="text-[#111827] font-semibold">{report.missing_before ?? 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] flex items-center justify-between">
              <span className="text-[#111827]">Missing After</span>
              <span className="text-[#16a34a] font-semibold">{report.missing_after ?? 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#e5e7eb]">
              <p className="text-[#111827]">Numeric strategy: <span className="text-[#2563eb]">{report.missing_strategy?.numeric || "N/A"}</span></p>
              <p className="text-[#111827] mt-1">Categorical strategy: <span className="text-[#6b7280]">{report.missing_strategy?.categorical || "N/A"}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-[#16a34a]" size={16} />
          Cleaning Pipeline Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] flex items-center gap-2 text-[#111827]">
            <Trash2 size={16} className="text-[#6b7280]" /> Duplicate rows removed
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] flex items-center gap-2 text-[#111827]">
            <Table2 size={16} className="text-[#2563eb]" /> ID-like features removed
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#e5e7eb] flex items-center gap-2 text-[#111827]">
            <Droplets size={16} className="text-[#16a34a]" /> Missing values imputed
          </div>
        </div>
      </div>
    </div>
  );
}