import { useMemo, useState } from "react";

const usePagination = (data, initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  // Clamp without an effect: derive the safe page directly during render.
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, safePage, itemsPerPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (safePage < totalPages) setCurrentPage(safePage + 1);
  };

  const prevPage = () => {
    if (safePage > 1) setCurrentPage(safePage - 1);
  };

  const setItemsPerPage = (value) => {
    setItemsPerPageState(Number(value));
    setCurrentPage(1);
  };

  return {
    paginatedData,
    currentPage: safePage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    goToPage,
    nextPage,
    prevPage,
  };
};

export default usePagination;
