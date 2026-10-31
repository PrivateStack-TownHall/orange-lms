import React from "react";

import { getNestedValue } from "@/helpers";

import EmptyTable from "./EmptyTable";

const Table = ({ columns = [], data = [], rowKey = "id" }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Data Found"
        description="There are no records to display."
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-orange-100/50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap border border-gray-200 px-3 py-2 text-left font-medium"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr
              key={row?.[rowKey] ?? index}
              className="transition-colors hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="border border-gray-200 px-3 py-2 align-top"
                >
                  {column.render
                    ? column.render(row)
                    : (getNestedValue(row, column.key) ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
