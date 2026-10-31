import React from "react";

const LoadingTable = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className={`grid gap-2`}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <div
              key={col}
              className="h-10 animate-pulse rounded-sm bg-gray-200"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingTable;
