import React from "react";

const STATUS_VARIANTS = {
  Active: "bg-green-100 text-green-700",
  Published: "bg-green-100 text-green-700",

  Draft: "bg-gray-100 text-gray-700",
  Inactive: "bg-gray-100 text-gray-700",
  Archived: "bg-gray-100 text-gray-700",

  Pending: "bg-orange-100 text-orange-700",

  Submitted: "bg-blue-100 text-blue-700",

  Reviewed: "bg-violet-100 text-violet-700",

  Passed: "bg-emerald-100 text-emerald-700",

  Failed: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status, children, className = "" }) => {
  const label = status || children;

  return (
    <span
      className={`
        rounded-sm px-2 py-1
        text-xs font-medium
        ${STATUS_VARIANTS[label] || "bg-gray-100 text-gray-700"}
        ${className}
      `}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
