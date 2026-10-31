import React from "react";

const DetailCard = ({ title, icon: Icon, children, className = "" }) => {
  return (
    <div
      className={`
        rounded-sm border border-gray-200
        bg-[var(--color-surface)]
        p-5
        ${className}
      `}
    >
      {(title || Icon) && (
        <div className="mb-4 flex items-center gap-2">
          {Icon && <Icon size={18} className="text-[var(--color-primary)]" />}

          {title && (
            <h3 className="font-semibold text-[var(--color-text)]">{title}</h3>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default DetailCard;
