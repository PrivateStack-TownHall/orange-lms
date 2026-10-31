import React from "react";

import StatsCard from "./StatsCard";

const StatsGrid = ({ items = [], columns = 4, compact = false }) => {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };

  // `compact` skips the md: breakpoint so the grid always stays 2 columns —
  // used when StatsGrid sits inside a narrower container (e.g. beside PageHeader)
  // instead of spanning the full page width.
  const responsiveCols = compact
    ? "grid-cols-2"
    : gridCols[columns] || "md:grid-cols-4";

  return (
    <div className={`grid grid-cols-4 gap-3 ${responsiveCols}`}>
      {items.map((item, index) => (
        <StatsCard
          key={index}
          title={item.title}
          value={item.value}
          description={item.description}
          icon={item.icon}
          tone={item.tone}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
