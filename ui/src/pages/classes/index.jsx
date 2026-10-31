import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  BookOpen,
  PlayCircle,
  PencilLine,
  CheckCircle2,
  Calendar,
  Users,
  MoreVertical,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch, useSort } from "@/hooks";

import { can } from "@/helpers";

import ClassService from "@/services/modules/class.service";

import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import StatusBadge from "@/components/ui/status/StatusBadge";
import ProgressBar from "@/components/ui/progress/ProgressBar";
import Avatar from "@/components/ui/avatar/Avatar";

const LEVEL_TONE = {
  Beginner: "bg-blue-100 text-blue-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-purple-100 text-purple-700",
};

const CATEGORY_OPTIONS = [
  "Full Stack",
  "Front End",
  "Back End",
  "JS Basic",
  "Web Design",
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const STATUS_OPTIONS = ["Active", "Draft", "Archived", "Completed"];

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "createdAt", label: "Newest" },
];

const isPastMeeting = (m) =>
  m.meetingDate && new Date(m.meetingDate) < new Date();

const classProgress = (row) => {
  const total = row.meetings?.length || 0;
  if (!total) return 0;
  const held = row.meetings?.filter(isPastMeeting).length || 0;
  return Math.round((held / total) * 100);
};

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.classes[role] || PAGE_META.classes.Admin;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  const { openConfirm, openError, openSuccess } = usePopupStore();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await ClassService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load classes.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, [
    "code",
    "name",
    "category",
    "level",
  ]);

  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredData = useMemo(() => {
    return searchedData.filter((row) => {
      if (levelFilter && row.level !== levelFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      if (categoryFilter && row.category !== categoryFilter) return false;
      return true;
    });
  }, [searchedData, levelFilter, statusFilter, categoryFilter]);

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
  } = usePagination(sortedData, view === "grid" ? 6 : 10);

  const handleRemove = (id) => {
    openConfirm({
      title: "Delete Class",
      message:
        "Are you sure you want to delete this class? This action cannot be undone.",
      action: async () => {
        try {
          await ClassService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Class deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message:
              error?.response?.data?.message || "Failed to delete class.",
          });
        }
      },
    });
  };

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((c) => c.status === "Active").length;
    const draft = data.filter((c) => c.status === "Draft").length;
    const completed = data.filter((c) => c.status === "Completed").length;

    return [
      {
        title: "Total Classes",
        value: total,
        description: "All classes",
        icon: BookOpen,
        tone: "orange",
      },
      {
        title: "Active Classes",
        value: active,
        description: "Currently running",
        icon: PlayCircle,
        tone: "green",
      },
      {
        title: "Draft Classes",
        value: draft,
        description: "Not published",
        icon: PencilLine,
        tone: "blue",
      },
      {
        title: "Completed Classes",
        value: completed,
        description: "Finished",
        icon: CheckCircle2,
        tone: "purple",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Class Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-text)]">
            {row.name || "-"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.description ? row.description.slice(0, 40) : "-"}
          </p>
        </div>
      ),
    },
    {
      key: "code",
      label: "Code",
      render: (row) => (
        <span className="inline-block rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          {row.code || "-"}
        </span>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (row) => (
        <span
          className={`rounded-sm px-2 py-1 text-xs font-medium ${
            LEVEL_TONE[row.level] || "bg-gray-100 text-gray-700"
          }`}
        >
          {row.level || "-"}
        </span>
      ),
    },
    {
      key: "mentor",
      label: "Mentor",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.mentor?.name} size="xs" />
          <span>{row.mentor?.name || "-"}</span>
        </div>
      ),
    },
    {
      key: "mentees",
      label: "Mentees",
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]">
          <Users size={14} />
          {row.mentees?.length || 0}
        </span>
      ),
    },
    {
      key: "meetings",
      label: "Meetings",
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]">
          <Calendar size={14} />
          {row.meetings?.length || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
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
            resource="class"
            detailUrl={`/classes/${row.id}`}
            editUrl={`/classes/edit/${row.id}`}
            onDelete={handleRemove}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Classes..." />;
  }

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={page.title}
          description={page.description}
        />

        <div className="w-full shrink-0 xl:w-[800px]">
          <StatsGrid items={stats} columns={4} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search classes by name, mentor, or level..."
          filters={[
            {
              key: "level",
              label: "Levels",
              value: levelFilter,
              onChange: setLevelFilter,
              options: LEVEL_OPTIONS,
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: STATUS_OPTIONS,
            },
            {
              key: "category",
              label: "Categories",
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: CATEGORY_OPTIONS,
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
        <ClassGrid data={paginatedData} role={role} onDelete={handleRemove} />
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
        pageSizeOptions={view === "grid" ? [6, 12, 24] : [10, 25, 50]}
      />
    </div>
  );
};

const CLASS_ICON_TONE = [
  "bg-orange-100 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
];

const ClassGrid = ({ data, role, onDelete }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Classes Found"
        description="There are no classes to display."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((row, index) => (
        <div
          key={row.id}
          className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-sm font-bold ${
                  CLASS_ICON_TONE[index % CLASS_ICON_TONE.length]
                }`}
              >
                {(row.code || row.name || "?").slice(0, 2).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {row.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {row.description ? row.description.slice(0, 36) : "-"}
                </p>
              </div>
            </div>

            <ClassGridMenu id={row.id} role={role} onDelete={onDelete} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-sm bg-orange-100 px-2 py-1 font-medium text-orange-700">
              {row.code}
            </span>
            <StatusBadge status={row.status} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-[var(--color-text-muted)]">Mentor</p>
              <div className="mt-1 flex items-center gap-1.5 font-medium text-[var(--color-text)]">
                <Avatar name={row.mentor?.name} size="xs" />
                <span className="truncate">{row.mentor?.name || "-"}</span>
              </div>
            </div>

            <div>
              <p className="text-[var(--color-text-muted)]">Mentees</p>
              <p className="mt-1 flex items-center gap-1 font-medium text-[var(--color-text)]">
                <Users size={14} />
                {row.mentees?.length || 0}
              </p>
            </div>

            <div>
              <p className="text-[var(--color-text-muted)]">Meetings</p>
              <p className="mt-1 flex items-center gap-1 font-medium text-[var(--color-text)]">
                <Calendar size={14} />
                {row.meetings?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={classProgress(row)} />
          </div>

          <Link
            to={`/classes/${row.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-sm border border-gray-200 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50"
          >
            View Class
          </Link>
        </div>
      ))}
    </div>
  );
};

const ClassGridMenu = ({ id, role, onDelete }) => {
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
            to={`/classes/${id}`}
            className="block px-3 py-2 text-sm hover:bg-gray-50"
          >
            View
          </Link>

          {can(role, "class", "update") && (
            <Link
              to={`/classes/edit/${id}`}
              className="block px-3 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
          )}

          {can(role, "class", "delete") && (
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
