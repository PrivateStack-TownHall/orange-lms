import React from "react";

const TabsHeader = ({ tabs = [], activeTab, setActiveTab }) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] px-5">
      <div className="flex flex-wrap gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              flex items-center gap-2
              py-4 text-sm font-medium
              transition
              ${
                activeTab === tab.value
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab.icon && <tab.icon size={16} />}

            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsHeader;
