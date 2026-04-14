"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Circle,
  Database,
  FileSpreadsheet,
  LineChart,
  Sparkles,
  Wand2,
} from "lucide-react";

const pipelineSteps = ["Loading", "Cleaning", "EDA", "Visualization", "Insights"];

const features = [
  {
    title: "Automated Data Cleaning - No Manual Preparation Required",
    detail: "Detect and fix missing values, duplicates, and quality issues before analysis starts.",
    icon: Wand2,
  },
  {
    title: "Intelligent EDA - Discover Patterns Instantly",
    detail: "Generate descriptive statistics and discover important variable relationships automatically.",
    icon: Database,
  },
  {
    title: "Interactive Visualizations - Understand Data at a Glance",
    detail: "Create chart-ready outputs that make trends, outliers, and distributions easy to interpret.",
    icon: BarChart3,
  },
  {
    title: "AI-Generated Insights - Actionable Summaries in Seconds",
    detail: "Get concise executive summaries, findings, and practical recommendations in seconds.",
    icon: Sparkles,
  },
  {
    title: "Fast CSV Processing - Analyze Large Datasets Effortlessly",
    detail: "Run end-to-end analytics pipelines quickly with minimal setup and no manual coding.",
    icon: FileSpreadsheet,
  },
];

const valueProps = [
  "Save hours of manual analysis",
  "No coding required",
  "Instant, consistent results",
  "Built for speed and scalability",
];

function RevealSection({ children, className = "", delay = 0, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      {...props}
      className={`${className} transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#f9fafb]">
      <header className="w-full px-6 lg:px-16 xl:px-24 py-6 lg:py-8">
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
              <LineChart size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold text-[#111827]">Insight</p>
              <p className="text-xs text-[#6b7280]">Analytics Platform</p>
            </div>
          </div>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] hover:-translate-y-0.5 text-white text-sm font-medium transition-all duration-200"
          >
            Analyze Your Data Now
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="w-full space-y-16 lg:space-y-24 pb-16 lg:pb-24">
          <RevealSection className="w-full px-6 lg:px-16 xl:px-24 py-16 lg:py-24 bg-white border-y border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden" delay={40}>
            <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-[#dbeafe] blur-3xl opacity-70" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#dcfce7] blur-3xl opacity-60" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#eff6ff] via-transparent to-[#f0fdf4] opacity-70" aria-hidden="true" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">AI-Powered Analytics</p>
                <h1 className="text-4xl sm:text-5xl font-semibold text-[#111827] mt-3 leading-tight">
                  Turn Raw Data into Insights in Seconds - Fully Automated with AI
                </h1>
                <p className="text-sm sm:text-base text-[#6b7280] mt-4 leading-7 max-w-[560px]">
                  Upload your dataset and get automated insights, visualizations, and analytics instantly.
                </p>
                <p className="text-sm text-[#111827] mt-2 font-medium">No setup. No coding. Just upload and analyze.</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] hover:-translate-y-0.5 text-white text-sm font-medium transition-all duration-200"
                  >
                    Analyze Your Data Now
                    <ArrowRight size={15} />
                  </Link>
                  <a
                    href="#preview"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] hover:-translate-y-0.5 text-sm text-[#111827] transition-all duration-200"
                  >
                    View Demo
                  </a>
                </div>
                <p className="text-xs text-[#6b7280] mt-3">Upload a CSV and get instant insights</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#111827]">Fully Automated Pipeline</p>
                <p className="text-sm text-[#6b7280] mt-1">From raw data to insights - every step handled automatically.</p>

                <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111827]">Automation Snapshot</p>
                    <span className="text-xs text-[#16a34a] font-medium">Pipeline Active</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {pipelineSteps.map((step, index) => (
                      <div
                        key={step}
                        className="rounded-lg border border-[#e5e7eb] px-3 py-2.5 bg-white flex items-center justify-between opacity-0"
                        style={{ animation: `stepReveal 450ms ease-out forwards`, animationDelay: `${120 + index * 90}ms` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white flex items-center justify-center">
                            <Check size={12} />
                          </span>
                          <span className="text-sm text-[#111827] font-medium">{step}</span>
                        </div>
                        <span className="text-xs text-[#6b7280]">Step {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]" delay={70}>
            <h2 className="text-base font-semibold text-[#111827]">Product Overview</h2>
            <p className="text-sm text-[#6b7280] mt-3 leading-7">
              Insight eliminates manual data analysis by automating the entire workflow-from ingestion and cleaning to visualization and AI-generated insights. Get decision-ready results in seconds.
            </p>
          </RevealSection>

          <RevealSection className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]" delay={100}>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-semibold text-[#111827]">How It Works</h2>
              <p className="text-xs text-[#6b7280]">5-step automated pipeline</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {pipelineSteps.map((step, index) => (
                <div key={`step-${step}`} className="rounded-xl border border-[#e5e7eb] bg-white p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center">
                      <Check size={12} />
                    </span>
                    <span className="text-xs text-[#6b7280]">0{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-[#111827] mt-3">{step}</p>
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 space-y-4" delay={130}>
            <h2 className="text-base font-semibold text-[#111827]">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="group w-full h-full bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
                  >
                    <span className="w-9 h-9 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
                      <Icon size={16} className="text-[#2563eb]" />
                    </span>
                    <h3 className="text-sm font-semibold text-[#111827] mt-3">{feature.title}</h3>
                    <p className="text-sm text-[#6b7280] mt-2 leading-6">{feature.detail}</p>
                  </article>
                );
              })}
            </div>
          </RevealSection>

          <RevealSection id="preview" className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]" delay={160}>
            <span className="inline-flex items-center rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-2.5 py-1 text-[11px] font-medium text-[#6b7280]">Real Output Preview</span>
            <h2 className="text-base font-semibold text-[#111827] mt-2">Sample Output Preview</h2>
            <p className="text-sm text-[#6b7280] mt-2">Representative dashboard-style output after one automated analysis run.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl border border-[#e5e7eb] p-4 shadow-[0_0_0_1px_rgba(37,99,235,0.06),0_10px_24px_rgba(37,99,235,0.08)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">AI Generated</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#dcfce7]">Auto Insights</span>
                </div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">AI Summary</p>
                <p className="text-sm text-[#111827] mt-2 leading-6">
                  Revenue concentration is driven by a small set of high-performing segments with stable month-over-month growth and low volatility.
                </p>
              </div>

              <div className="rounded-xl border border-[#e5e7eb] p-4 lg:col-span-2 shadow-[0_0_0_1px_rgba(22,163,74,0.06),0_10px_24px_rgba(22,163,74,0.08)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#111827]">Trend Visualization</p>
                  <p className="text-xs text-[#6b7280]">Auto-generated</p>
                </div>
                <div className="h-36 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 flex items-end gap-2">
                  {[44, 62, 55, 78, 69, 88, 94].map((value, index) => (
                    <div key={`bar-${value}-${index}`} className="flex-1 flex items-end">
                      <div className="w-full bg-[#2563eb] rounded-t-sm" style={{ height: `${value}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]" delay={190}>
            <h2 className="text-base font-semibold text-[#111827]">Why Teams Choose Insight</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {valueProps.map((item) => (
                <div key={item} className="rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-3 flex items-center gap-2.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200">
                  <Circle size={10} className="text-[#16a34a] fill-[#16a34a]" />
                  <p className="text-sm text-[#111827]">{item}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                <p className="text-xs text-[#6b7280]">Avg. Time Saved</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">6-10 hrs/project</p>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                <p className="text-xs text-[#6b7280]">Pipeline Steps</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">5 Automated Stages</p>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                <p className="text-xs text-[#6b7280]">Input Format</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">CSV Ready</p>
              </div>
              <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
                <p className="text-xs text-[#6b7280]">Output Speed</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">Seconds, not hours</p>
              </div>
            </div>
          </RevealSection>

          <RevealSection className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-16 lg:py-24 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" delay={220}>
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">Start Analyzing Your Data Today</h2>
              <p className="text-sm text-[#6b7280] mt-2">No setup. No complexity. Just results.</p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] hover:-translate-y-0.5 text-white text-sm font-medium transition-all duration-200"
            >
              Try It Now
              <ArrowRight size={15} />
            </Link>
          </RevealSection>

        <footer className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-[#111827] font-medium">Insight (Analytics Platform)</p>
          <div className="flex items-center gap-4 text-sm text-[#6b7280]">
            <a href="#" className="hover:text-[#111827]">About</a>
            <a href="#" className="hover:text-[#111827]">GitHub</a>
            <a href="#" className="hover:text-[#111827]">Contact</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
