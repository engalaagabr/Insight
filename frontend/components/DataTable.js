"use client";

import { Table2 } from "lucide-react";

export default function DataTable({ data }) {
  if (!data) return null;

  const allRows = data.preview || [];
  const rows = allRows.slice(0, 10);
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const isEmpty = !rows.length;

  return (
    <section className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center gap-2">
        <Table2 size={16} className="text-[#6b7280]" />
        <h3 className="text-sm font-semibold text-[#111827]">Dataset Preview</h3>
        <span className="ml-auto text-xs text-[#6b7280]">First 10 of {allRows.length} rows</span>
      </div>

      {isEmpty ? (
        <div className="px-5 py-8 text-sm text-[#6b7280]">
          Preview is unavailable. Run analysis on a valid CSV to populate sample rows.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j}>{typeof row[col] === "number" ? row[col].toFixed(2) : String(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
