import React from "react";

const CircularProgress = ({ value = 0, size = 120, strokeWidth = 10 }) => {
  const safeValue = Math.min(Math.max(value, 0), 100);

  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[var(--color-primary)] transition-all duration-500"
        />
      </svg>

      <div className="absolute text-center">
        <p className="text-xl font-bold text-[var(--color-text)]">
          {safeValue}%
        </p>
      </div>
    </div>
  );
};

export default CircularProgress;
