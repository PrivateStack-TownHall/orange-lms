import React from "react";

import Breadcrumbs from "./Breadcrumbs";

const PageHeader = ({ breadcrumbs, title, description, actions }) => {
  return (
    <div className="space-y-2">
      {breadcrumbs?.length > 0 && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {title}
          </h1>

          {description && (
            <p className="max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
