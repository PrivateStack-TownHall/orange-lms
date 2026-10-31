import React from "react";
import { Database } from "lucide-react";

const EmptyTable = ({
  title = "No Data Found",
  description = "There is currently no data available.",
  icon: Icon = Database,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-gray-200 py-12 text-center">
      <div className="rounded-full bg-gray-100 p-4">
        <Icon size={32} className="text-[var(--color-text-muted)]" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
        {description}
      </p>
    </div>
  );
};

export default EmptyTable;
