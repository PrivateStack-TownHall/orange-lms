import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.to || item.label} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight size={14} className="text-gray-300" />}

            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-[var(--color-primary)]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-[var(--color-text)]" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
