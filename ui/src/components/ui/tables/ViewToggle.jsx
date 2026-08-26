import { LayoutGrid, List } from "lucide-react";

const ViewToggle = ({ view, setView }) => {
  if (!setView) return null;

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-sm border border-gray-200 bg-white p-1">
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-label="Grid view"
        className={`flex h-8 w-8 items-center justify-center rounded-sm transition-colors ${
          view === "grid"
            ? "bg-[var(--color-primary)] text-white"
            : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        <LayoutGrid size={16} />
      </button>

      <button
        type="button"
        onClick={() => setView("table")}
        aria-label="Table view"
        className={`flex h-8 w-8 items-center justify-center rounded-sm transition-colors ${
          view === "table"
            ? "bg-[var(--color-primary)] text-white"
            : "text-gray-400 hover:bg-gray-100"
        }`}
      >
        <List size={16} />
      </button>
    </div>
  );
};

export default ViewToggle;
