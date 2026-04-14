"use client";

import { FileUp } from "lucide-react";

export default function UploadCard({ setFile, selectedFileName, selectedFileSize }) {
  return (
    <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#111827]">Upload Dataset</h3>
        <span className="text-xs text-[#6b7280]">CSV only</span>
      </div>
      <label className="mt-4 flex items-center gap-3 rounded-xl border-2 border-dashed border-[#d1d5db] px-4 py-5 bg-white hover:bg-[#f9fafb] transition-colors duration-200 cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-[#f3f4f6] flex items-center justify-center">
          <FileUp size={16} className="text-[#6b7280]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#111827] font-medium truncate">{selectedFileName || "Choose CSV file"}</p>
          <p className="text-xs text-[#6b7280] mt-1">
            {selectedFileSize ? `${selectedFileSize} MB` : "Drag and drop or click to select"}
          </p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
    </section>
  );
}
