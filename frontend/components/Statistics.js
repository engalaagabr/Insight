"use client";

import { BarChart3, TrendingUp, Activity } from "lucide-react";

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function StatsTable({ columns, statKeys, summary }) {
  return (
    <div className="overflow-x-auto border border-[#e5e7eb] rounded-xl">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr>
            <th>Metric</th>
            {columns.map((columnName) => (
              <th key={`head-${columnName}`}>{columnName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {statKeys.map((statKey) => (
            <tr key={`row-${statKey}`}>
              <td className="font-medium">{statKey}</td>
              {columns.map((columnName) => (
                <td key={`cell-${statKey}-${columnName}`}>{formatNumber(summary?.[columnName]?.[statKey])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorrelationMatrixTable({ matrix, columns }) {
  return (
    <div className="overflow-x-auto border border-[#e5e7eb] rounded-xl">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr>
            <th>Feature</th>
            {columns.map((column) => (
              <th key={`m-head-${column}`}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((rowFeature) => (
            <tr key={`m-row-${rowFeature}`}>
              <td className="font-medium">{rowFeature}</td>
              {columns.map((colFeature) => (
                <td key={`m-cell-${rowFeature}-${colFeature}`}>{formatNumber(matrix?.[rowFeature]?.[colFeature])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorrelationPairsTable({ title, pairs, colorClass }) {
  return (
    <section className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h3 className="text-sm font-semibold text-[#111827] mb-3">{title}</h3>
      {pairs.length ? (
        <div className="overflow-x-auto border border-[#e5e7eb] rounded-xl">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th>Feature A</th>
                <th>Feature B</th>
                <th>Correlation</th>
                <th>Absolute Correlation</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair, idx) => (
                <tr key={`${title}-${pair.feature_a}-${pair.feature_b}-${idx}`}>
                  <td>{pair.feature_a}</td>
                  <td>{pair.feature_b}</td>
                  <td className={`font-semibold ${colorClass}`}>{formatNumber(pair.correlation)}</td>
                  <td>{formatNumber(pair.abs_correlation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[#6b7280]">No correlation pairs available.</p>
      )}
    </section>
  );
}

export default function Statistics({ data }) {
  const summary = data?.statistics?.summary || {};
  const topPairs = data?.correlations?.top_pairs || [];
  const correlationMatrix = data?.correlations?.matrix || {};
  const statKeys = ["count", "mean", "std", "min", "25%", "50%", "75%", "max"];

  const columns = Object.keys(summary);
  const matrixColumns = Object.keys(correlationMatrix);
  const strongestPairs = topPairs.slice(0, 5);
  const additionalPairs = topPairs.slice(5, 10);

  if (!columns.length) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[#6b7280] text-sm">
        No numeric statistics available for this dataset.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h2 className="text-base font-semibold text-[#111827] flex items-center gap-3">
          <TrendingUp className="text-[#16a34a]" size={18} />
          Statistical Analysis
        </h2>
        <p className="text-sm text-[#6b7280] mt-2">Backend-computed descriptive statistics and correlation highlights</p>
      </div>

      <section className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-3 mb-3">
          <BarChart3 className="text-[#2563eb]" size={16} />
          Dataset Profile
        </h3>
        <div className="overflow-x-auto border border-[#e5e7eb] rounded-xl">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rows</td>
                <td>{formatNumber(data?.dataset?.rows)}</td>
              </tr>
              <tr>
                <td>Columns</td>
                <td>{formatNumber(data?.dataset?.columns)}</td>
              </tr>
              <tr>
                <td>Numeric Columns</td>
                <td>{formatNumber(data?.dataset?.numeric_columns?.length || 0)}</td>
              </tr>
              <tr>
                <td>Categorical Columns</td>
                <td>{formatNumber(data?.dataset?.categorical_columns?.length || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#111827] mb-3">Descriptive Statistics Matrix</h3>
        <StatsTable columns={columns} statKeys={statKeys} summary={summary} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CorrelationPairsTable title="Strongest Correlations" pairs={strongestPairs} colorClass="text-[#16a34a]" />
        <CorrelationPairsTable title="Additional Correlations" pairs={additionalPairs} colorClass="text-[#6b7280]" />
      </div>

      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-3 mb-4">
          <Activity className="text-[#2563eb]" size={16} />
          Correlation Matrix
        </h3>
        {matrixColumns.length ? (
          <CorrelationMatrixTable matrix={correlationMatrix} columns={matrixColumns} />
        ) : (
          <p className="text-[#6b7280] text-sm">No correlation matrix available.</p>
        )}
      </div>
    </div>
  );
}
