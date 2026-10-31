import React from "react";

const ProgressBar = ({ value = 0, showLabel = true }) => {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>Progress</span>
          <span>{safeValue}%</span>
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-[var(--color-primary)] transition-all duration-300"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
