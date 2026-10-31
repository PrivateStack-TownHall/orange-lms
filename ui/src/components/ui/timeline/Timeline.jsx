import React from "react";

const Timeline = ({ items = [] }) => {
  if (!items.length) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        No timeline available
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-5">
      <div className="space-y-0">
        {items.map((item, index) => (
          <div key={index} className="relative flex gap-4 pb-6">
            {/* Line */}
            {index !== items.length - 1 && (
              <div className="absolute left-[7px] top-4 h-full w-[2px] bg-gray-200" />
            )}

            {/* Dot */}
            <div className="relative z-10 mt-1 h-4 w-4 rounded-full bg-[var(--color-primary)]" />

            {/* Content */}
            <div className="flex-1">
              <h4 className="font-medium text-[var(--color-text)]">
                {item.title}
              </h4>

              {item.description && (
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {item.description}
                </p>
              )}

              {item.date && (
                <p className="mt-1 text-xs text-gray-400">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
