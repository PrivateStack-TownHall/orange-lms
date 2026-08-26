import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const buildPageList = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];

  if (currentPage > 3) pages.push("...");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i += 1) pages.push(i);

  if (currentPage < totalPages - 2) pages.push("...");

  pages.push(totalPages);

  return pages;
};

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  prevPage,
  nextPage,
  goToPage,
  total,
  itemsPerPage,
  setItemsPerPage,
  pageSizeOptions = [10, 25, 50],
}) => {
  const pages = buildPageList(currentPage, totalPages);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
      {typeof total === "number" && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Showing {(currentPage - 1) * itemsPerPage + (total ? 1 : 0)} to{" "}
          {Math.min(currentPage * itemsPerPage, total)} of {total} results
        </p>
      )}

      <div className="flex items-center gap-2">
        {totalPages > 1 && (
          <>
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            {pages.map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="px-1 text-sm text-[var(--color-text-muted)]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage?.(page)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-sm border text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {setItemsPerPage && (
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(e.target.value)}
            className="ml-1 rounded-sm border border-gray-200 px-2 py-1.5 text-sm outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default Pagination;
