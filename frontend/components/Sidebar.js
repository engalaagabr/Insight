"use client";

import { LayoutDashboard, Wand2, BarChart3, LineChart, Lightbulb } from "lucide-react";

export default function Sidebar({ setPage, currentPage, datasetHistory }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "preprocessing", label: "Preprocessing", icon: Wand2 },
    { id: "statistics", label: "Statistics", icon: BarChart3, group: "Analysis" },
    { id: "visualizations", label: "Visualizations", icon: BarChart3, group: "Analysis" },
    { id: "insights", label: "Insights", icon: Lightbulb },
  ];
  const groupedItems = [
    { label: "Workspace", items: navItems.filter((item) => !item.group) },
    { label: "Analysis", items: navItems.filter((item) => item.group === "Analysis") },
  ];

  return (
    <aside className="w-[240px] bg-white h-screen fixed left-0 top-0 border-r border-[#e5e7eb] flex flex-col">
      <div className="p-5 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2563eb] rounded-lg flex items-center justify-center">
            <LineChart size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#111827]">Insight</h1>
            <p className="text-xs text-[#6b7280]">Analytics Platform</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-3">
        {groupedItems.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide px-2 py-1.5">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-all duration-200 ${
                    isActive
                      ? "bg-[#f9fafb] text-[#111827] border-[#e5e7eb]"
                      : "bg-white text-[#6b7280] border-transparent hover:bg-[#f9fafb] hover:text-[#111827]"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-[#2563eb]" : "text-[#9ca3af]"} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">Dataset History</p>
          <ul className="mt-2 space-y-2">
            {(datasetHistory || []).length ? (
              (datasetHistory || []).slice(0, 6).map((item) => (
                <li key={item.id} className="rounded-lg border border-[#e5e7eb] px-2.5 py-2">
                  <p className="text-xs text-[#111827] truncate">{item.name}</p>
                  <p className="text-[11px] text-[#6b7280] mt-1">{item.meta}</p>
                </li>
              ))
            ) : (
              <li className="text-xs text-[#6b7280]">No datasets analyzed yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-[#e5e7eb]">
        <p className="text-xs text-[#6b7280]">Insight v1.0</p>
      </div>
    </aside>
  );
}
