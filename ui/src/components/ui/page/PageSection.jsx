import React from "react";

const PageSection = ({ children, title, className = "" }) => {
  return (
    <section
      className={`
        rounded-sm border border-gray-200
        bg-[var(--color-surface)]
        p-4
        ${className}
      `}
    >
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h2>
      )}

      {children}
    </section>
  );
};

export default PageSection;
