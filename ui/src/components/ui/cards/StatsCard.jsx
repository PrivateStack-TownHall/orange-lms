import React from "react";

const TONE_CLASSES = {
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  red: "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-600",
  gray: "bg-gray-100 text-gray-600",
};

const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  tone = "gray",
  className = "",
}) => {
  return (
    <div
      className={`
        rounded-sm border border-gray-200
        bg-[var(--color-surface)]
        p-4
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">{title}</p>

          <h3 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`rounded-sm p-2 ${TONE_CLASSES[tone] || TONE_CLASSES.gray}`}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
