import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  CalendarDays,
  PlayCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Clock,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch, useSort } from "@/hooks";

import { can } from "@/helpers";

import MeetingService from "@/services/modules/meeting.service";

import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import Avatar from "@/components/ui/avatar/Avatar";

const isPast = (row) =>
  row.meetingDate && new Date(row.meetingDate) < new Date();

const meetingStatus = (row) => (isPast(row) ? "Completed" : "Upcoming");

const STATUS_TONE = {
  Upcoming: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

const SORT_OPTIONS = [
  { key: "name", label: "Topic" },
  { key: "meetingDate", label: "Meeting Date" },
];

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.meetings?.[role] || PAGE_META.meetings?.Admin;

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await MeetingService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load meetings.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, [
    "name",
    "description",
  ]);

  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const classOptions = useMemo(
    () =>
      Array.from(
        new Map(
          data
            .filter((m) => m.class)
            .map((m) => [
              m.class.id,
              { label: m.class.name, value: String(m.class.id) },
            ]),
        ).values(),
      ),
    [data],
  );

  const filteredData = useMemo(() => {
    return searchedData.filter((row) => {
      if (classFilter && String(row.class?.id) !== classFilter) return false;
      if (statusFilter && meetingStatus(row) !== statusFilter) return false;
      return true;
    });
  }, [searchedData, classFilter, statusFilter]);

  const { sortedData, sortKey, toggleSort } = useSort(filteredData);

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, view === "grid" ? 8 : 10);

  const handleRemove = (id) => {
    openConfirm({
      title: "Delete Meeting",
      message:
        "Are you sure you want to delete this meeting? This action cannot be undone.",
      action: async () => {
        try {
          await MeetingService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Meeting deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message:
              error?.response?.data?.message || "Failed to delete meeting.",
          });
        }
      },
    });
  };

  const stats = useMemo(() => {
    const total = data.length;
    const upcoming = data.filter((m) => !isPast(m)).length;
    const completed = data.filter((m) => isPast(m)).length;
    const cancelled = 0;

    return [
      {
        title: "Total Meetings",
        value: total,
        description: "All time",
        icon: CalendarDays,
        tone: "orange",
      },
      {
        title: "Upcoming",
        value: upcoming,
        description: "Scheduled",
        icon: PlayCircle,
        tone: "green",
      },
      {
        title: "Completed",
        value: completed,
        description: "Finished",
        icon: CheckCircle2,
        tone: "blue",
      },
      {
        title: "Cancelled",
        value: cancelled,
        description: "Cancelled",
        icon: XCircle,
        tone: "purple",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Meeting Title",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-text)]">{row.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.description ? row.description.slice(0, 40) : "-"}
          </p>
        </div>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (row) => (
        <div>
          <p>{row.class?.name || "-"}</p>
          <span className="rounded-sm bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
            {row.class?.code || "-"}
          </span>
        </div>
      ),
    },
    { key: "meetingNumber", label: "Meeting #" },
    {
      key: "meetingDate",
      label: "Date & Time",
      render: (row) => (
        <div className="text-xs">
          <p className="flex items-center gap-1 font-medium text-[var(--color-text)]">
            <CalendarDays size={12} />
            {row.meetingDate
              ? new Date(row.meetingDate).toLocaleDateString("id-ID")
              : "-"}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[var(--color-text-muted)]">
            <Clock size={12} />
            {row.startHour || "-"} - {row.finishHour || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "creator",
      label: "Mentor",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.creator?.name} size="xs" />
          <span>{row.creator?.name || "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`rounded-sm px-2 py-1 text-xs font-medium ${STATUS_TONE[meetingStatus(row)]}`}
        >
          {meetingStatus(row)}
        </span>
      ),
    },
    { key: "actions", label: "Actions" },
  ];

  const tableData = useMemo(
    () =>
      paginatedData.map((row) => ({
        ...row,
        actions: (
          <TableActions
            id={row.id}
            role={role}
            resource="meeting"
            detailUrl={`/meetings/${row.id}`}
            editUrl={`/meetings/edit/${row.id}`}
            onDelete={handleRemove}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Meetings..." />;
  }

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={page.title}
          description={page.description}
        />

        <div className="w-full shrink-0 xl:w-[720px]">
          <StatsGrid items={stats} columns={4} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search meetings by title, class, or mentor..."
          filters={[
            {
              key: "class",
              label: "Classes",
              value: classFilter,
              onChange: setClassFilter,
              options: classOptions,
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: ["Upcoming", "Completed"],
            },
          ]}
          sortOptions={SORT_OPTIONS}
          sortKey={sortKey}
          toggleSort={toggleSort}
          view={view}
          setView={setView}
        />
      </div>

      {view === "table" ? (
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)]">
          <div className="p-4">
            <Table columns={columns} data={tableData} />
          </div>
        </div>
      ) : (
        <MeetingGrid data={paginatedData} role={role} onDelete={handleRemove} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={sortedData.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        pageSizeOptions={view === "grid" ? [8, 16, 24] : [10, 25, 50]}
      />
    </div>
  );
};

const MEETING_ICON_TONE = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-green-100 text-green-600",
];

const MeetingGrid = ({ data, role, onDelete }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Meetings Found"
        description="There are no meetings to display."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((row, index) => (
        <div
          key={row.id}
          className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-sm ${
                MEETING_ICON_TONE[index % MEETING_ICON_TONE.length]
              }`}
            >
              <CalendarDays size={18} />
            </div>

            <MeetingGridMenu id={row.id} role={role} onDelete={onDelete} />
          </div>

          <span
            className={`mt-3 inline-block w-fit rounded-sm px-2 py-1 text-xs font-medium ${
              STATUS_TONE[meetingStatus(row)]
            }`}
          >
            {meetingStatus(row)}
          </span>

          <p className="mt-2 font-semibold text-[var(--color-text)]">
            {row.name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.class?.name || "-"}
          </p>

          <div className="mt-3 space-y-1 text-xs text-[var(--color-text-muted)]">
            <p className="flex items-center gap-1.5">
              <CalendarDays size={12} />
              {row.meetingDate
                ? new Date(row.meetingDate).toLocaleDateString("id-ID")
                : "-"}
            </p>
            <p className="flex items-center gap-1.5">
              <Clock size={12} />
              {row.startHour || "-"} - {row.finishHour || "-"}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            <Avatar name={row.creator?.name} size="xs" />
            <span className="truncate font-medium">
              {row.creator?.name || "-"}
            </span>
          </div>

          <span className="mt-3 w-fit rounded-sm bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
            Meeting #{row.meetingNumber}
          </span>

          <Link
            to={`/meetings/${row.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-sm border border-gray-200 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50"
          >
            View Meeting
          </Link>
        </div>
      ))}
    </div>
  );
};

const MeetingGridMenu = ({ id, role, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-sm p-1 text-gray-400 hover:bg-gray-100"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg"
        >
          <Link
            to={`/meetings/${id}`}
            className="block px-3 py-2 text-sm hover:bg-gray-50"
          >
            View
          </Link>

          {can(role, "meeting", "update") && (
            <Link
              to={`/meetings/edit/${id}`}
              className="block px-3 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
          )}

          {can(role, "meeting", "delete") && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(id);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default List;
