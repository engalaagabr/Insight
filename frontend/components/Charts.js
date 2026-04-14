"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function numericColumnsFromPreview(rows) {
  if (!rows?.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.filter((key) => {
    const numericCount = rows.filter((row) => toNumeric(row[key]) !== null).length;
    return numericCount >= Math.max(3, Math.floor(rows.length * 0.6));
  });
}

function toNumeric(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const normalized = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/%/g, "");

  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function categoricalColumnsFromPreview(rows) {
  if (!rows?.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.filter((key) => {
    const numericCount = rows.filter((row) => toNumeric(row[key]) !== null).length;
    return numericCount < Math.max(3, Math.floor(rows.length * 0.6));
  });
}

function histogramData(rows, key, binCount = 10) {
  const values = rows.map((r) => toNumeric(r[key])).filter((v) => v !== null);
  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [{ bin: `${min}`, count: values.length }];

  const step = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    start: min + i * step,
    end: min + (i + 1) * step,
    count: 0,
  }));

  values.forEach((value) => {
    const idx = Math.min(Math.floor((value - min) / step), binCount - 1);
    bins[idx].count += 1;
  });

  return bins.map((b) => ({
    bin: `${b.start.toFixed(1)}-${b.end.toFixed(1)}`,
    count: b.count,
  }));
}

function categoryFrequency(rows, key, limit = 8) {
  const frequency = new Map();
  rows.forEach((row) => {
    const value = String(row[key] ?? "Unknown");
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function averageByCategory(rows, categoryKey, numericKey, limit = 8) {
  const grouped = new Map();

  rows.forEach((row) => {
    const category = String(row[categoryKey] ?? "Unknown");
    const numericValue = toNumeric(row[numericKey]);
    if (numericValue === null) return;

    const existing = grouped.get(category) || { sum: 0, count: 0 };
    existing.sum += numericValue;
    existing.count += 1;
    grouped.set(category, existing);
  });

  return Array.from(grouped.entries())
    .map(([category, values]) => ({
      category,
      avg: values.count ? Number((values.sum / values.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit);
}

function dualMetricTrend(rows, keyA, keyB) {
  return rows
    .slice(0, 120)
    .map((row, index) => ({
      index,
      [keyA]: toNumeric(row[keyA]),
      [keyB]: toNumeric(row[keyB]),
    }))
    .filter((row) => row[keyA] !== null || row[keyB] !== null);
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
      <p className="text-xs text-[#6b7280] mt-1 mb-4">{subtitle}</p>
      {children}
    </section>
  );
}

export default function Charts({ data }) {
  const rows = data?.preview || [];
  const numericKeys = numericColumnsFromPreview(rows);
  const categoricalKeys = categoricalColumnsFromPreview(rows);
  const topPairs = data?.correlations?.top_pairs || [];
  const colorScale = ["#3b82f6", "#9ca3af", "#60a5fa", "#6b7280", "#93c5fd", "#d1d5db", "#2563eb", "#4b5563"];

  if (!rows.length || !numericKeys.length) {
    return <section className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-sm text-[#6b7280]">No numeric data available for visualizations.</section>;
  }

  const xKey = numericKeys[0];
  const yKey = numericKeys[1] || numericKeys[0];

  const lineData = rows
    .slice(0, 80)
    .map((row, index) => ({
      index,
      [xKey]: toNumeric(row[xKey]),
      [yKey]: toNumeric(row[yKey]),
    }))
    .filter((row) => row[xKey] !== null || row[yKey] !== null);

  const scatterData = rows
    .map((row) => ({ [xKey]: toNumeric(row[xKey]), [yKey]: toNumeric(row[yKey]) }))
    .filter((row) => row[xKey] !== null && row[yKey] !== null)
    .slice(0, 160);

  const histData = histogramData(rows, xKey, 12);
  const trendData = dualMetricTrend(rows, xKey, yKey);

  const topCategoryKey = categoricalKeys[0] || null;
  const frequencyData = topCategoryKey ? categoryFrequency(rows, topCategoryKey, 8) : [];
  const categoryAverageData = topCategoryKey ? averageByCategory(rows, topCategoryKey, xKey, 8) : [];
  const correlationBars = topPairs.slice(0, 8).map((pair) => ({
    pair: `${pair.feature_a} ↔ ${pair.feature_b}`,
    value: Number(pair.correlation || 0),
  }));

  return (
    <div className="space-y-5">
      <ChartCard title="Line Chart" subtitle="Trend by row index">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Line dataKey={xKey} stroke="#3b82f6" strokeWidth={2} dot={false} />
            {yKey !== xKey ? <Line dataKey={yKey} stroke="#9ca3af" strokeWidth={2} dot={false} /> : null}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Correlations" subtitle="Strongest feature relationships">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={correlationBars}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="pair" stroke="#9ca3af" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} />
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Area Trend" subtitle={`Smoothed comparison of ${xKey}${yKey !== xKey ? ` and ${yKey}` : ""}`}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Legend />
            <Area type="monotone" dataKey={xKey} stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
            {yKey !== xKey ? <Area type="monotone" dataKey={yKey} stroke="#9ca3af" fill="#f3f4f6" strokeWidth={2} /> : null}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Scatter Plot" subtitle={`${xKey} vs ${yKey}`}>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey={xKey} stroke="#9ca3af" />
            <YAxis dataKey={yKey} stroke="#9ca3af" />
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Scatter data={scatterData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Histogram" subtitle={`Distribution of ${xKey}`}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histData}>
            <CartesianGrid stroke="#e5e7eb" />
            <XAxis dataKey="bin" stroke="#9ca3af" tick={{ fontSize: 10 }} />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {topCategoryKey ? (
        <ChartCard title="Category Distribution" subtitle={`Top values in ${topCategoryKey}`}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Legend />
              <Pie data={frequencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                {frequencyData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={colorScale[index % colorScale.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}

      {topCategoryKey ? (
        <ChartCard title="Category Averages" subtitle={`Average ${xKey} by ${topCategoryKey}`}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryAverageData}>
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}
    </div>
  );
}
