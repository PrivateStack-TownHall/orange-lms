import React from "react";

import ProgressBar from "./ProgressBar";

const ProgressStatus = ({ title, value = 0, label }) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
      {title && (
        <h4 className="mb-2 font-medium text-[var(--color-text)]">{title}</h4>
      )}

      <ProgressBar value={value} showLabel={false} />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>

        <span className="font-semibold text-[var(--color-text)]">{value}%</span>
      </div>
    </div>
  );
};

export default ProgressStatus;
