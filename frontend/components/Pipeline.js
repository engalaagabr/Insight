"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Circle, Loader2 } from "lucide-react";

export default function Pipeline({ step = 0, loading = false }) {
  const steps = useMemo(() => ([
    { title: "Loading", detail: "CSV ingestion and schema detection." },
    { title: "Cleaning", detail: "Missing values, duplicates, and quality checks." },
    { title: "EDA", detail: "Descriptive stats and correlation computation." },
    { title: "Visualization", detail: "Chart-ready preview data preparation." },
    { title: "Insights", detail: "AI summary and recommendations generation." },
  ]), []);
  const [expandedStep, setExpandedStep] = useState(step > 0 ? Math.min(step - 1, steps.length - 1) : 0);

  const toggleStep = (index) => {
    setExpandedStep((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#111827]">Processing Pipeline</h3>
        <p className="text-xs text-[#6b7280]">
          Stage {Math.min(step, steps.length)} of {steps.length}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto pt-4">
        {steps.map((pipelineStep, i) => (
          <div key={pipelineStep.title} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                i < step
                  ? "bg-[#16a34a] border-[#16a34a] text-white"
                  : i === step && loading
                  ? "bg-white border-[#2563eb] text-[#2563eb]"
                  : "bg-white border-[#d1d5db] text-[#9ca3af]"
              }`}>
                {i < step ? <Check size={14} /> : i === step && loading ? <Loader2 size={14} className="animate-spin" /> : <Circle size={14} />}
              </div>
              <span className={`text-xs mt-2 font-medium ${i < step ? "text-[#16a34a]" : i === step && loading ? "text-[#2563eb]" : "text-[#6b7280]"}`}>
                {pipelineStep.title}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className={`w-10 h-[1px] ${
                i < step - 1 ? "bg-[#16a34a]" : "bg-[#e5e7eb]"
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((pipelineStep, i) => {
          const isExpanded = expandedStep === i;
          const isDone = i < step;
          const isCurrent = i === step && loading;

          return (
            <button
              key={`detail-${pipelineStep.title}`}
              onClick={() => toggleStep(i)}
              className={`w-full text-left rounded-lg border px-3.5 py-3 transition-all duration-200 ${
                isDone
                  ? "border-[#16a34a] bg-white"
                  : isCurrent
                  ? "border-[#2563eb] bg-[#f9fafb]"
                  : "border-[#e5e7eb] bg-white hover:bg-[#f9fafb]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#111827]">{pipelineStep.title}</p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    {isDone ? "Completed" : isCurrent ? "In progress" : "Pending"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[#6b7280] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
              </div>
              {isExpanded ? (
                <p className="text-sm text-[#6b7280] mt-3 leading-6">{pipelineStep.detail}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}