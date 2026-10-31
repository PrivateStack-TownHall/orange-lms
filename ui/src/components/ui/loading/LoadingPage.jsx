import React from "react";

import LoadingSpinner from "./LoadingSpinner";

const LoadingPage = ({ title = "Loading..." }) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <LoadingSpinner size={36} />

      <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
    </div>
  );
};

export default LoadingPage;
