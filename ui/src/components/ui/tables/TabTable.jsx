import React from "react";

import useSearch from "@/hooks/useSearch";
import useFilter from "@/hooks/useFilter";
import useSort from "@/hooks/useSort";
import usePagination from "@/hooks/usePagination";

import Table from "./Table";
import TableControls from "./TableControls";
import Pagination from "./Pagination";

const TabTable = ({
  data = [],
  columns = [],
  pageSize = 5,

  filterOptions = [],
}) => {
  const finalColumns =
    columns.length > 0
      ? columns
      : data[0]
        ? Object.keys(data[0]).map((key) => ({
            key,
            label: key,
          }))
        : [];

  const { query, setQuery, searchedData } = useSearch(
    data,
    finalColumns.map((col) => col.key),
  );

  const { filterValue, setFilterValue, filteredData } = useFilter(
    searchedData,
    finalColumns[0]?.key || "",
  );

  const { sortedData, sortKey, toggleSort } = useSort(filteredData);

  const { paginatedData, currentPage, totalPages, nextPage, prevPage } =
    usePagination(sortedData, pageSize);

  return (
    <div className="space-y-4">
      <TableControls
        searchQuery={query}
        setSearchQuery={setQuery}
        filterOptions={filterOptions}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        sortOptions={finalColumns.map((col) => ({
          key: col.key,
          label: col.label,
        }))}
        sortKey={sortKey}
        toggleSort={toggleSort}
      />

      <Table columns={finalColumns} data={paginatedData} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </div>
  );
};

export default TabTable;
