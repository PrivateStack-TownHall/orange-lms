import React, { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, CircleCheck, CircleX, History } from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";
import { formatDate } from "@/helpers";
import HistoryClassService from "@/services/modules/historyClass.service";

import StatsGrid from "@/components/ui/cards/StatsGrid";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";
import StatusBadge from "@/components/ui/status/StatusBadge";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import Pagination from "@/components/ui/tables/Pagination";
import Table from "@/components/ui/tables/Table";
import TableControls from "@/components/ui/tables/TableControls";

const STATUS_OPTIONS = ["Completed", "Failed", "Dropped", "Archived"];
const ROLE_OPTIONS = ["Mentor", "Mentee"];

const HistoryClasses = () => {
  const breadcrumbs = useBreadcrumbs();
  const { openError } = usePopupStore();

  const [histories, setHistories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyResponse, summaryResponse] = await Promise.all([
          HistoryClassService.getAll(),
          HistoryClassService.getSummary(),
        ]);

        setHistories(historyResponse.data || []);
        setSummary(summaryResponse.data || null);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load class history.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [openError]);

  const searchableHistory = useMemo(
    () =>
      histories.map((history) => ({
        ...history,
        className: history.Class?.name || "",
        classCode: history.Class?.code || "",
        participantName: history.User?.name || "",
        participantEmail: history.User?.email || "",
      })),
    [histories],
  );

  const { query, setQuery, searchedData } = useSearch(searchableHistory, [
    "className",
    "classCode",
    "participantName",
    "participantEmail",
  ]);

  const filteredHistory = useMemo(
    () =>
      searchedData.filter((history) => {
        if (statusFilter && history.status !== statusFilter) return false;
        if (roleFilter && history.roleInClass !== roleFilter) return false;
        return true;
      }),
    [searchedData, roleFilter, statusFilter],
  );

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredHistory);

  const stats = useMemo(
    () => [
      {
        title: "Archived Records",
        value: summary?.total ?? histories.length,
        description: "All class participants",
        icon: History,
        tone: "orange",
      },
      {
        title: "Completed",
        value: summary?.completed ?? 0,
        description: "Completed learning paths",
        icon: CircleCheck,
        tone: "green",
      },
      {
        title: "Needs Review",
        value: (summary?.failed ?? 0) + (summary?.dropped ?? 0),
        description: "Failed or dropped records",
        icon: CircleX,
        tone: "red",
      },
      {
        title: "Archived Classes",
        value: summary?.archived ?? 0,
        description: "Archived participant records",
        icon: ArchiveRestore,
        tone: "blue",
      },
    ],
    [histories.length, summary],
  );

  const columns = [
    {
      key: "className",
      label: "Class",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-text)]">
            {row.Class?.name || "-"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.Class?.code || "-"} {row.Class?.level ? `- ${row.Class.level}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "participantName",
      label: "Participant",
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{row.User?.name || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.User?.email || "-"}</p>
        </div>
      ),
    },
    {
      key: "roleInClass",
      label: "Role",
      render: (row) => <span className="text-sm">{row.roleInClass || "-"}</span>,
    },
    {
      key: "finalScore",
      label: "Final Score",
      render: (row) => <span className="font-medium">{row.finalScore ?? "-"}</span>,
    },
    {
      key: "attendancePercentage",
      label: "Attendance",
      render: (row) => <span>{row.attendancePercentage ?? "-"}%</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "completedAt",
      label: "Completed",
      render: (row) => (row.completedAt ? formatDate(row.completedAt) : "-"),
    },
  ];

  if (loading) return <LoadingPage title="Loading Class History..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title="History Classes"
          description="Review completed and archived class records."
        />
        <div className="w-full shrink-0 xl:w-[800px]">
          <StatsGrid items={stats} columns={4} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search by class or participant..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: STATUS_OPTIONS,
            },
            {
              key: "role",
              label: "Roles",
              value: roleFilter,
              onChange: setRoleFilter,
              options: ROLE_OPTIONS,
            },
          ]}
          view="table"
          setView={() => {}}
        />
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)]">
        <div className="p-4">
          {paginatedData.length ? (
            <Table columns={columns} data={paginatedData} />
          ) : (
            <EmptyTable
              title="No History Found"
              description="No class history matches the current filters."
              icon={History}
            />
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={filteredHistory.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};

export default HistoryClasses;
