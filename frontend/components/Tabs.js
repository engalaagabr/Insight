export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="bg-[#f3f4f6] rounded-xl p-1.5 inline-flex gap-1 border border-[#e5e7eb] w-full overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb] ${
              isActive
                ? "bg-white border-[#e5e7eb] text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                : "bg-transparent border-transparent text-[#6b7280] hover:text-[#111827] hover:bg-white/60"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}