"use client";

function InsightKpiCard({ label, value, insight }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
      <p className="text-xl font-semibold text-[#111827] mt-1">{value}</p>
      <p className="text-xs text-[#6b7280] mt-2 leading-5">{insight}</p>
    </div>
  );
}

function TwoColumnTable({ title, rows, emptyText }) {
  return (
    <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
      {rows.length ? (
        <div className="mt-3 overflow-x-auto border border-[#e5e7eb] rounded-xl">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr>
                <th className="w-44">Category</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={`${title}-${idx}`}>
                  <td className="font-medium">{row.category}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[#6b7280]">{emptyText}</p>
      )}
    </section>
  );
}

function ActionPlanTable({ actionPlan, recommendations, nextSteps }) {
  const derivedRows = Array.from({ length: Math.max(recommendations.length, nextSteps.length) }, (_, idx) => ({
    priority: idx === 0 ? "High" : idx <= 2 ? "Medium" : "Low",
    recommendation: recommendations[idx] || "-",
    execution_step: nextSteps[idx] || "-",
  }));

  const rows = actionPlan?.length ? actionPlan : derivedRows;

  if (!rows.length) {
    return (
      <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-sm font-semibold text-[#111827]">Action Plan</h2>
        <p className="mt-3 text-sm text-[#6b7280]">No action items available.</p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h2 className="text-sm font-semibold text-[#111827]">Action Plan</h2>
      <div className="mt-3 overflow-x-auto border border-[#e5e7eb] rounded-xl">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr>
              <th className="w-28">Priority</th>
              <th>Recommendation</th>
              <th>Execution Step</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`action-${idx}`}>
                <td>{row.priority || "Low"}</td>
                <td>{row.recommendation || "-"}</td>
                <td>{row.execution_step || row.nextStep || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function InsightsView({ data }) {
  const insights = data?.insights || {};
  const dataset = data?.dataset || {};
  const domainContext = insights.domain_context || {};

  const aiKpis = Array.isArray(insights.ai_kpis) && insights.ai_kpis.length
    ? insights.ai_kpis.slice(0, 4)
    : [
        { label: "Rows", value: (dataset.rows || 0).toLocaleString(), insight: "Dataset scale available for analysis." },
        { label: "Columns", value: (dataset.columns || 0).toLocaleString(), insight: "Feature breadth available for modeling." },
        {
          label: "Top Correlation",
          value: data?.correlations?.top_pairs?.[0] ? String(data.correlations.top_pairs[0].correlation) : "N/A",
          insight: "Strongest numeric relationship discovered in this dataset.",
        },
        {
          label: "Domain Confidence",
          value: domainContext?.confidence ? `${Math.round(Number(domainContext.confidence) * 100)}%` : "N/A",
          insight: "Confidence score from domain inference analysis.",
        },
      ];

  const overviewRows = [
    { category: "Rows", detail: (dataset.rows || 0).toLocaleString() },
    { category: "Columns", detail: (dataset.columns || 0).toLocaleString() },
    { category: "Numeric Columns", detail: String((dataset.numeric_columns || []).length) },
    { category: "Categorical Columns", detail: String((dataset.categorical_columns || []).length) },
    { category: "Top Correlation Pair", detail: data?.correlations?.top_pairs?.[0] ? `${data.correlations.top_pairs[0].feature_a} ↔ ${data.correlations.top_pairs[0].feature_b}` : "N/A" },
  ];

  const findingsRows = [
    ...(insights.key_statistics || []).map((item) => ({ category: "Key Statistic", detail: item })),
    ...(insights.correlations || []).map((item) => ({ category: "Correlation", detail: item })),
    ...(insights.trends || []).map((item) => ({ category: "Trend", detail: item })),
    ...(insights.search_findings || []).map((item) => ({ category: "Search Insight", detail: item })),
  ];

  const riskRows = [
    ...(insights.anomalies || []).map((item) => ({ category: "Anomaly", detail: item })),
    ...(insights.risk_flags || []).map((item) => ({ category: "Risk Flag", detail: item })),
  ];

  const domainRows = [
    { category: "Primary Domain", detail: domainContext.primary_domain || "general_analytics" },
    {
      category: "Domain Confidence",
      detail: domainContext?.confidence !== undefined
        ? `${Math.round(Number(domainContext.confidence) * 100)}%`
        : "N/A",
    },
    ...((domainContext.signals || []).map((signal) => ({ category: "Signal", detail: signal }))),
  ];

  const insightCards = [
    {
      title: "Executive Summary",
      body: insights.executive_summary || "No summary available for this dataset.",
    },
    {
      title: "Dataset Overview (Llama)",
      body: insights.dataset_overview || "Dataset overview is not available.",
    },
    {
      title: "Primary Recommendation",
      body: insights.recommendations?.[0] || "No recommendations available.",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-base font-semibold text-[#111827]">AI-Generated Insights</h2>
        <p className="text-sm text-[#6b7280] mt-1">Scannable highlights generated from your current analysis output.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {aiKpis.map((kpi, idx) => (
          <InsightKpiCard
            key={`insight-kpi-${idx}`}
            label={kpi.label || `KPI ${idx + 1}`}
            value={kpi.value || "N/A"}
            insight={kpi.insight || "AI-generated KPI summary."}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {insightCards.map((item) => (
          <article key={item.title} className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h2 className="text-sm font-semibold text-[#111827]">{item.title}</h2>
            <p className="text-sm text-[#6b7280] mt-2 leading-6">{item.body}</p>
          </article>
        ))}
      </section>

      <TwoColumnTable title="Domain Intelligence" rows={domainRows} emptyText="No domain inference available." />
      <TwoColumnTable title="Dataset Snapshot Table" rows={overviewRows} emptyText="No dataset overview table available." />
      <TwoColumnTable title="Findings Table" rows={findingsRows} emptyText="No findings available." />
      <TwoColumnTable title="Risk Register" rows={riskRows} emptyText="No risks or anomalies were reported." />
      <ActionPlanTable
        actionPlan={insights.action_plan || []}
        recommendations={insights.recommendations || []}
        nextSteps={insights.next_steps || []}
      />
    </div>
  );
}
